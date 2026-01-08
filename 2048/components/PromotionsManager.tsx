'use client';

import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Percent, Calendar, Share2 } from 'lucide-react';
import { Promotion, Service } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface PromotionsManagerProps {
  promotions: Promotion[];
  services: Service[];
  onUpdate: (promotions: Promotion[]) => void;
  salonId?: string;
  salonName?: string;
  salonAddress?: string;
  salonPhone?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function PromotionsManager({ 
  promotions, 
  services, 
  onUpdate,
  salonId,
  salonName,
  salonAddress,
  salonPhone 
}: PromotionsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'service' as 'service' | 'day',
    discount: 10,
    serviceIds: [] as string[],
    days: [] as number[],
    active: true,
  });

  const handleAdd = () => {
    if (!formData.name.trim() || formData.discount <= 0 || formData.discount > 100) return;
    if (formData.type === 'service' && formData.serviceIds.length === 0) return;
    if (formData.type === 'day' && formData.days.length === 0) return;

    const newPromotion: Promotion = {
      id: generateUniqueId(),
      name: formData.name,
      type: formData.type,
      discount: formData.discount,
      serviceIds: formData.type === 'service' ? formData.serviceIds : undefined,
      days: formData.type === 'day' ? formData.days : undefined,
      active: formData.active,
    };

    onUpdate([...promotions, newPromotion]);
    resetForm();
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setFormData({
      name: promotion.name,
      type: promotion.type,
      discount: promotion.discount,
      serviceIds: promotion.serviceIds || [],
      days: promotion.days || [],
      active: promotion.active,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || formData.discount <= 0 || formData.discount > 100 || !editingId) return;

    const updatedPromotions = promotions.map(p =>
      p.id === editingId
        ? {
            ...p,
            name: formData.name,
            type: formData.type,
            discount: formData.discount,
            serviceIds: formData.type === 'service' ? formData.serviceIds : undefined,
            days: formData.type === 'day' ? formData.days : undefined,
            active: formData.active,
          }
        : p
    );

    onUpdate(updatedPromotions);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta promoción?')) {
      onUpdate(promotions.filter(p => p.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updatedPromotions = promotions.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    onUpdate(updatedPromotions);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'service',
      discount: 10,
      serviceIds: [],
      days: [],
      active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const sharePromotionToWhatsApp = (promotion: Promotion) => {
    if (!salonId) return;
    
    const bookingLink = `${window.location.origin}/client/book/${salonId}`;
    
    // Obtener servicios con descuento
    let servicesText = '';
    if (promotion.type === 'service' && promotion.serviceIds) {
      const promoServices = promotion.serviceIds
        .map(id => services.find(s => s.id === id))
        .filter(Boolean)
        .slice(0, 3)
        .map(s => `${s!.name} $${s!.price.toLocaleString()}`)
        .join(' • ');
      servicesText = promoServices ? `\n${promoServices}` : '';
    }

    // Obtener días de la promoción
    let daysText = '';
    if (promotion.type === 'day' && promotion.days) {
      const dayNames = promotion.days
        .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
        .filter(Boolean)
        .join(', ');
      daysText = dayNames ? `\n📅 ${dayNames}` : '';
    }

    // Crear mensaje compacto para WhatsApp (< 700 caracteres)
    const message = `🎁 *PROMOCIÓN ESPECIAL* 🎁

*${promotion.name}*
${promotion.discount}% OFF${servicesText}${daysText}

✨ *${salonName || 'Nuestro Salón'}* ✨

⏰ Lun-Sáb 09:00-18:00
📍 ${salonAddress || ''}
📞 ${salonPhone || ''}

🔗 Reservá ahora:
${bookingLink}

¡No te lo pierdas! 💇‍♀️`;

    // Verificar longitud
    if (message.length > 700) {
      console.warn(`Mensaje muy largo: ${message.length} caracteres`);
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="text-black rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Promociones</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-black rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Promoción
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="mb-6 p-6 bg-gradient-to-br from-text-black to-accent-50 rounded-xl">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Promoción' : 'Nueva Promoción'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre de la Promoción *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Descuento de Lunes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Tipo de Promoción *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="service"
                    checked={formData.type === 'service'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'service' | 'day' })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>Por Servicio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="day"
                    checked={formData.type === 'day'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'service' | 'day' })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>Por Día</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Descuento (%) *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {formData.type === 'service' && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Seleccionar Servicios *
                </label>
                {services.length === 0 ? (
                  <p className="text-sm text-black">No hay servicios disponibles. Agrega servicios primero.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.serviceIds.includes(service.id)
                            ? 'border-primary-500 text-black'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm">{service.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.type === 'day' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Días *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.days.includes(day.value)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-primary-700 ">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="px-6 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 transition-all"
            >
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="space-y-3">
        {promotions.length === 0 ? (
          <div className="text-center py-12 text-black">
            <Tag className="h-16 w-16 mx-auto mb-4 text-black" />
            <p>No hay promociones creadas</p>
            <p className="text-sm">Haz clic en "Agregar Promoción" para comenzar</p>
          </div>
        ) : (
          promotions.map((promotion) => (
            <div
              key={promotion.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                promotion.active
                  ? 'border-gray-200 hover:shadow-md'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-gray-900">{promotion.name}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {promotion.discount}% OFF
                  </span>
                  {promotion.type === 'service' ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Por Servicio
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      Por Día
                    </span>
                  )}
                </div>

                {promotion.type === 'service' && promotion.serviceIds && (
                  <div className="text-sm text-black">
                    <span className="font-medium">Servicios: </span>
                    {promotion.serviceIds
                      .map(id => services.find(s => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}

                {promotion.type === 'day' && promotion.days && (
                  <div className="text-sm text-black">
                    <span className="font-medium">Días: </span>
                    {promotion.days
                      .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {salonId && (
                  <button
                    onClick={() => sharePromotionToWhatsApp(promotion)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Compartir en WhatsApp"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                )}
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotion.active}
                    onChange={() => toggleActive(promotion.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>

                <button
                  onClick={() => handleEdit(promotion)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(promotion.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
