import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiPlus, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiShield,
  FiUserCheck
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const GerenciamentoTenantsAdmin = () => {
  const { temRole } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTenants, setUserTenants] = useState([]);
  const [showTenantModal, setShowTenantModal] = useState(false);

  useEffect(() => {
    if (!temRole('adminMaster')) {
      setError('Você não tem permissão para acessar esta página');
      return;
    }
    carregarDados();
  }, [temRole]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [usuariosResponse] = await Promise.all([
        api.get('/user-roles')
      ]);
      
      // Filtrar apenas usuários que têm role admin
      const usuariosAdmin = usuariosResponse.data.filter(usuario => 
        usuario.todasRoles?.includes('admin') || usuario.isAdminMaster
      );
      
      setUsuarios(usuariosAdmin);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const carregarTenantsUsuario = async (userId) => {
    try {
      const response = await api.get(`/tenant-admin/users/${userId}/tenants`);
      setUserTenants(response.data.tenantsDisponiveis || []);
      setSelectedUser(userId);
      setShowTenantModal(true);
    } catch (err) {
      setError('Erro ao carregar tenants do usuário');
    }
  };

  const alternarAdminTenant = async (userId, tenantId, isCurrentlyAdmin) => {
    try {
      if (isCurrentlyAdmin) {
        await api.post(`/tenant-admin/users/${userId}/remove-admin`, { tenantId });
      } else {
        await api.post(`/tenant-admin/users/${userId}/add-admin`, { tenantId });
      }
      
      // Recarregar dados
      await carregarDados();
      if (selectedUser) {
        await carregarTenantsUsuario(selectedUser);
      }
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao alterar permissão de tenant');
    }
  };

  if (!temRole('adminMaster')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 font-medium">
            Acesso negado. Apenas AdminMaster pode acessar esta página.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FaBuilding className="text-indigo-600 text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Tenants Admin
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie quais tenants cada administrador pode gerenciar
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Lista de administradores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiUserCheck className="text-blue-500" />
              Administradores
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="p-6">
                <div className="flex items-center justify-between">
                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {usuario.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{usuario.nome}</h3>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </div>
                      {usuario.isAdminMaster && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin Master
                        </span>
                      )}
                    </div>

                    {/* Informações de tenants admin */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Tenants Admin:</span>
                      </div>
                      
                      {usuario.isAdminMaster ? (
                        <span className="text-sm text-blue-600 font-medium">
                          Acesso completo a todos os tenants
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {usuario.adminTenants?.length > 0 ? (
                            usuario.adminTenants.map((tenantId, index) => (
                              <span
                                key={tenantId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                Tenant {index + 1}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              Nenhum tenant admin específico
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="ml-4">
                    {!usuario.isAdminMaster && (
                      <button
                        onClick={() => carregarTenantsUsuario(usuario.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <FaBuilding className="h-4 w-4" />
                        Gerenciar Tenants
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {usuarios.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum administrador encontrado
            </h3>
            <p className="text-gray-500">
              Não há administradores para gerenciar no momento.
            </p>
          </div>
        )}

        {/* Modal de gerenciamento de tenants */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gerenciar Tenants Admin
                  </h3>
                  <button
                    onClick={() => {
                      setShowTenantModal(false);
                      setSelectedUser(null);
                      setUserTenants([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {userTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {tenant.nomeFantasia || tenant.nome}
                        </h4>
                        <p className="text-sm text-gray-500">{tenant.nome}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          tenant.isAdmin 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tenant.isAdmin ? 'Admin' : 'Sem permissão'}
                        </span>
                        
                        <button
                          onClick={() => alternarAdminTenant(selectedUser, tenant.id, tenant.isAdmin)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            tenant.isAdmin
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {tenant.isAdmin ? 'Remover' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {userTenants.length === 0 && (
                  <div className="text-center py-8">
                    <FaBuilding className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Nenhum tenant disponível para este usuário.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciamentoTenantsAdmin;
