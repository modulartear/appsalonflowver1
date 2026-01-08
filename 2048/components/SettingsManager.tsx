'use client';

import { useState } from 'react';
import { Settings, Users, CreditCard, Plus, Edit2, Trash2, User } from 'lucide-react';
import { Stylist, PaymentMethod } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface SettingsManagerProps {
  stylists: Stylist[];
  paymentMethods: PaymentMethod[];
  onUpdateStylists: (stylists: Stylist[]) => void;
  onUpdatePaymentMethods: (methods: PaymentMethod[]) => void;
}

export default function SettingsManager({
  stylists,
  paymentMethods,
  onUpdateStylists,
  onUpdatePaymentMethods,
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'stylists' | 'payments'>('stylists');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('stylists')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'stylists'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline h-5 w-5 mr-2" />
          Estilistas
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'payments'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CreditCard className="inline h-5 w-5 mr-2" />
          Métodos de Pago
        </button>
      </div>

      {/* Content */}
      {activeTab === 'stylists' ? (
        <StylistsSection stylists={stylists} onUpdate={onUpdateStylists} />
      ) : (
        <PaymentMethodsSection methods={paymentMethods} onUpdate={onUpdatePaymentMethods} />
      )}
    </div>
  );
}

// Stylists Section Component
function StylistsSection({
  stylists,
  onUpdate,
}: {
  stylists: Stylist[];
  onUpdate: (stylists: Stylist[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialties: [] as string[],
    newSpecialty: '',
    active: true,
  });

  const handleAdd = () => {
    if (!formData.name.trim()) return;

    const newStylist: Stylist = {
      id: generateUniqueId(),
      name: formData.name,
      specialties: formData.specialties,
      active: formData.active,
    };

    onUpdate([...stylists, newStylist]);
    resetForm();
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingId(stylist.id);
    setFormData({
      name: stylist.name,
      specialties: stylist.specialties,
      newSpecialty: '',
      active: stylist.active,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !editingId) return;

    const updatedStylists = stylists.map(s =>
      s.id === editingId
        ? { ...s, name: formData.name, specialties: formData.specialties, active: formData.active }
        : s
    );

    onUpdate(updatedStylists);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estilista?')) {
      onUpdate(stylists.filter(s => s.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updatedStylists = stylists.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    onUpdate(updatedStylists);
  };

  const addSpecialty = () => {
    if (formData.newSpecialty.trim() && !formData.specialties.includes(formData.newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, formData.newSpecialty.trim()],
        newSpecialty: '',
      });
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty),
    });
  };

  const resetForm = () => {
    setFormData({ name: '', specialties: [], newSpecialty: '', active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div>
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Agregar Estilista
        </button>
      )}

      {isAdding && (
        <div className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingId ? 'Editar Estilista' : 'Nuevo Estilista'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: María García"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.newSpecialty}
                  onChange={(e) => setFormData({ ...formData, newSpecialty: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Coloración, Corte"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {specialty}
                    <button
                      onClick={() => removeSpecialty(specialty)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
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

      <div className="space-y-3">
        {stylists.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No hay estilistas registrados</p>
          </div>
        ) : (
          stylists.map((stylist) => (
            <div
              key={stylist.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                stylist.active ? 'border-gray-200 hover:shadow-md' : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{stylist.name}</h4>
                {stylist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stylist.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stylist.active}
                    onChange={() => toggleActive(stylist.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>

                <button
                  onClick={() => handleEdit(stylist)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(stylist.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

// Payment Methods Section Component
function PaymentMethodsSection({
  methods,
  onUpdate,
}: {
  methods: PaymentMethod[];
  onUpdate: (methods: PaymentMethod[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'local' as 'local' | 'online',
    details: '',
    token: '',
    accountInfo: '',
    active: true,
  });

  const handleAdd = () => {
    if (!formData.name.trim()) return;

    const newMethod: PaymentMethod = {
      id: generateUniqueId(),
      name: formData.name,
      type: formData.type,
      details: formData.details,
      token: formData.type === 'online' ? formData.token : undefined,
      accountInfo: formData.type === 'online' ? formData.accountInfo : undefined,
      active: formData.active,
    };

    onUpdate([...methods, newMethod]);
    resetForm();
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      type: method.type,
      details: method.details || '',
      token: method.token || '',
      accountInfo: method.accountInfo || '',
      active: method.active,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !editingId) return;

    const updatedMethods = methods.map(m =>
      m.id === editingId
        ? { 
            ...m, 
            name: formData.name, 
            type: formData.type, 
            details: formData.details,
            token: formData.type === 'online' ? formData.token : undefined,
            accountInfo: formData.type === 'online' ? formData.accountInfo : undefined,
            active: formData.active 
          }
        : m
    );

    onUpdate(updatedMethods);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este método de pago?')) {
      onUpdate(methods.filter(m => m.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updatedMethods = methods.map(m =>
      m.id === id ? { ...m, active: !m.active } : m
    );
    onUpdate(updatedMethods);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'local', details: '', token: '', accountInfo: '', active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div>
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Agregar Método de Pago
        </button>
      )}

      {isAdding && (
        <div className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingId ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Método *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Efectivo, Tarjeta de Crédito"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="local"
                    checked={formData.type === 'local'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'local' | 'online' })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-black">Pago Local (en el salón)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    checked={formData.type === 'online'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'local' | 'online' })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-black">Pago Online</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalles (opcional)
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Información adicional sobre este método de pago"
              />
            </div>

            {/* Campos adicionales para pagos online */}
            {formData.type === 'online' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token / API Key {formData.name.toLowerCase().includes('mercado pago') && '(Mercado Pago)'}
                  </label>
                  <input
                    type="text"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder={formData.name.toLowerCase().includes('mercado pago') 
                      ? "APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                      : "Token de la plataforma de pago"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.toLowerCase().includes('mercado pago') 
                      ? "Obtén tu token en: Mercado Pago → Tu negocio → Configuración → Credenciales" 
                      : "Token o clave API de la plataforma de pago"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Información de Cuenta (CBU/Alias/Email)
                  </label>
                  <input
                    type="text"
                    value={formData.accountInfo}
                    onChange={(e) => setFormData({ ...formData, accountInfo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="CBU, Alias, Email de cuenta, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Información que se mostrará al cliente para realizar el pago
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
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

      <div className="space-y-3">
        {methods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No hay métodos de pago configurados</p>
          </div>
        ) : (
          methods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                method.active ? 'border-gray-200 hover:shadow-md' : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-gray-900">{method.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      method.type === 'local'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {method.type === 'local' ? 'Pago Local' : 'Pago Online'}
                  </span>
                  {method.type === 'online' && method.token && (
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                      ✓ Token configurado
                    </span>
                  )}
                </div>
                {method.details && (
                  <p className="text-sm text-gray-600 mb-1">{method.details}</p>
                )}
                {method.type === 'online' && method.accountInfo && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Cuenta:</span> {method.accountInfo}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.active}
                    onChange={() => toggleActive(method.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>

                <button
                  onClick={() => handleEdit(method)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
