'use client';

import { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';
import { Service } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface ServicesManagerProps {
  services: Service[];
  onUpdate: (services: Service[]) => void;
}

export default function ServicesManager({ services, onUpdate }: ServicesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
  });

  const handleAdd = () => {
    if (!formData.name.trim() || formData.price <= 0) return;

    const newService: Service = {
      id: generateUniqueId(),
      name: formData.name,
      duration: formData.duration,
      price: formData.price,
      description: formData.description,
      active: true,
    };

    onUpdate([...services, newService]);
    resetForm();
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || '',
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || formData.price <= 0 || !editingId) return;

    const updatedServices = services.map(s =>
      s.id === editingId
        ? { ...s, ...formData }
        : s
    );

    onUpdate(updatedServices);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      onUpdate(services.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', duration: 30, price: 0, description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Scissors className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Servicio
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Corte de cabello"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="5"
                  step="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Breve descripción"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
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

      {/* Services List */}
      <div className="space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scissors className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No hay servicios agregados</p>
            <p className="text-sm">Haz clic en "Agregar Servicio" para comenzar</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${service.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
