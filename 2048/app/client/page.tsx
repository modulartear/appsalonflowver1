'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Scissors, MapPin, Clock, Search, ArrowRight, Star } from 'lucide-react';
import { getSalons } from '@/lib/api';
import { Salon } from '@/lib/types';

export default function ClientPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    const allSalons = await getSalons();
    setSalons(allSalons);
    setFilteredSalons(allSalons);
  };

  useEffect(() => {
    const filtered = salons.filter(salon => {
      const matchesSearch = salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           salon.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === '' || salon.address.includes(cityFilter);
      return matchesSearch && matchesCity;
    });
    setFilteredSalons(filtered);
  }, [searchTerm, cityFilter, salons]);

  const cities = Array.from(new Set(salons.map(s => {
    const parts = s.address.split(',');
    return parts[parts.length - 1]?.trim() || 'Sin ciudad';
  })));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                SalonFlow
              </span>
            </Link>
            <Link
              href="/salon/register"
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              ¿Tienes un salón?
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Encuentra tu Salón Ideal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Reserva tu turno en los mejores salones de belleza y peluquerías
          </p>

          {/* Search and Filter */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar salón por nombre o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                />
              </div>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg bg-white"
              >
                <option value="">Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Salons Grid */}
        {filteredSalons.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <Scissors className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {salons.length === 0 ? 'No hay salones registrados aún' : 'No se encontraron salones'}
            </h3>
            <p className="text-gray-600 mb-8">
              {salons.length === 0 
                ? 'Sé el primero en registrar tu salón' 
                : 'Intenta con otros términos de búsqueda'}
            </p>
            {salons.length === 0 && (
              <Link
                href="/salon/register"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
              >
                Registrar Mi Salón
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{filteredSalons.length}</span> {filteredSalons.length === 1 ? 'salón' : 'salones'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSalons.map((salon, index) => (
                <div
                  key={salon.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Salon Header */}
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold">{salon.name}</h3>
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-semibold">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-4 w-4" />
                      <span>{salon.city}</span>
                    </div>
                  </div>

                  {/* Salon Body */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {salon.description || 'Salón de belleza profesional'}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Clock className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium">
                          {salon.workingHours ? `${salon.workingHours.start} - ${salon.workingHours.end}` : 'Horario no disponible'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <span className="text-sm">{salon.address}</span>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Servicios:</p>
                      <div className="flex flex-wrap gap-2">
                        {salon.services.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                          >
                            {service.name}
                          </span>
                        ))}
                        {salon.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{salon.services.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Book Button */}
                    <Link
                      href={`/client/book/${salon.id}`}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold group"
                    >
                      Reservar Turno
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
