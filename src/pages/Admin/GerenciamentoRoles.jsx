import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiPlus, 
  FiTrash2, 
  FiEdit3, 
  FiCheck, 
  FiX, 
  FiShield,
  FiSave 
} from 'react-icons/fi';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const GerenciamentoRoles = () => {
  const { temRole } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showAddRole, setShowAddRole] = useState(null);

  const rolesDisponiveis = [
    { value: 'medico', label: 'Médico', color: 'bg-green-100 text-green-800' },
    { value: 'tecnico', label: 'Técnico', color: 'bg-blue-100 text-blue-800' },
    { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
    { value: 'recepcionista', label: 'Recepcionista', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'adminMaster', label: 'Admin Master', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (!temRole('admin') && !temRole('adminMaster')) {
      setError('Você não tem permissão para acessar esta página');
      return;
    }
    carregarUsuarios();
  }, [temRole]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-roles');
      setUsuarios(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const adicionarRole = async (userId, role) => {
    try {
      await api.post(`/user-roles/${userId}/add-role`, { role });
      await carregarUsuarios();
      setShowAddRole(null);
      setSelectedRole('');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao adicionar role');
    }
  };

  const removerRole = async (userId, role) => {
    try {
      await api.post(`/user-roles/${userId}/remove-role`, { role });
      await carregarUsuarios();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao remover role');
    }
  };

  const alterarRolePrincipal = async (userId, novaRolePrincipal) => {
    try {
      await api.put(`/user-roles/${userId}/primary-role`, { novaRolePrincipal });
      await carregarUsuarios();
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao alterar role principal');
    }
  };

  const getRoleColor = (role) => {
    const roleInfo = rolesDisponiveis.find(r => r.value === role);
    return roleInfo ? roleInfo.color : 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const roleInfo = rolesDisponiveis.find(r => r.value === role);
    return roleInfo ? roleInfo.label : role;
  };

  if (!temRole('admin') && !temRole('adminMaster')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 font-medium">
            Acesso negado. Você precisa ser administrador para acessar esta página.
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
            <div className="bg-purple-100 p-2 rounded-lg">
              <FiShield className="text-purple-600 text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Roles
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie as permissões e roles dos usuários do sistema
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Lista de usuários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiUsers className="text-blue-500" />
              Usuários e suas Roles
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="p-6">
                <div className="flex items-start justify-between">
                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
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

                    {/* Role principal */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Role Principal:</span>
                        {editingUser === usuario.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole || usuario.rolePrincipal}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {rolesDisponiveis.map(role => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => alterarRolePrincipal(usuario.id, selectedRole || usuario.rolePrincipal)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setSelectedRole('');
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(usuario.rolePrincipal)}`}>
                              {getRoleLabel(usuario.rolePrincipal)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingUser(usuario.id);
                                setSelectedRole(usuario.rolePrincipal);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Roles adicionais */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Roles Adicionais:</span>
                        <button
                          onClick={() => setShowAddRole(showAddRole === usuario.id ? null : usuario.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {usuario.rolesAdicionais?.map((role) => (
                          <div
                            key={role}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                          >
                            {getRoleLabel(role)}
                            <button
                              onClick={() => removerRole(usuario.id, role)}
                              className="ml-1 text-current hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                            >
                              <FiX className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {(!usuario.rolesAdicionais || usuario.rolesAdicionais.length === 0) && (
                          <span className="text-sm text-gray-500">Nenhuma role adicional</span>
                        )}
                      </div>

                      {/* Adicionar role */}
                      {showAddRole === usuario.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                            >
                              <option value="">Selecione uma role</option>
                              {rolesDisponiveis
                                .filter(role => 
                                  role.value !== usuario.rolePrincipal && 
                                  !usuario.rolesAdicionais?.includes(role.value)
                                )
                                .map(role => (
                                  <option key={role.value} value={role.value}>
                                    {role.label}
                                  </option>
                                ))
                              }
                            </select>
                            <button
                              onClick={() => selectedRole && adicionarRole(usuario.id, selectedRole)}
                              disabled={!selectedRole}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Adicionar
                            </button>
                            <button
                              onClick={() => {
                                setShowAddRole(null);
                                setSelectedRole('');
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status do usuário */}
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                {/* Resumo de todas as roles */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <strong>Todas as permissões:</strong> {usuario.todasRoles?.join(', ') || 'Nenhuma'}
                  </div>
                </div>

                {/* Tenants Admin - apenas para usuários com role admin */}
                {usuario.todasRoles?.includes('admin') && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Tenants Admin:</span>
                      {usuario.isAdminMaster && (
                        <span className="text-xs text-blue-600 font-medium">
                          (Admin Master - Todos os tenants)
                        </span>
                      )}
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
                )}
              </div>
            ))}
          </div>
        </div>

        {usuarios.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500">
              Não há usuários para gerenciar no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciamentoRoles;
