import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";
import { IoArrowBack } from "react-icons/io5";
import { FiUser, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import Select from "react-select";

export default function UsuarioForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    role: "tecnico",
    crm: "",
    isAdminMaster: false,
    tenant_id: [],
    especialidade: "",
    especialidades: [],
    papeis: [],
    ativo: true,
    permissaoFinanceiro: false,
  });

  const [tenants, setTenants] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tenantsResponse, especialidadesResponse, papeisResponse] =
          await Promise.all([
            api.get("/tenants"),
            api.get("/especialidades"),
            api.get("/papeis"),
          ]);

        setTenants(tenantsResponse.data);
        setEspecialidades(especialidadesResponse.data);

        if (id) {
          const usuarioResponse = await api.get(`/usuarios/${id}`);
          const usuario = usuarioResponse.data;

          // Format the specialties array correctly
          const especialidadesArray = Array.isArray(usuario.especialidades)
            ? usuario.especialidades
            : [usuario.especialidades].filter(Boolean);

          setFormData({
            ...usuario,
            senha: "",
            confirmarSenha: "",
            // Ensure we're using the correct format for especialidades
            especialidades: especialidadesArray.map((esp) =>
              typeof esp === "string" ? esp : esp._id || esp,
            ),
          });
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Sessão expirada. Redirecionando para login...");
          setTimeout(() => logout(), 2000);
        } else {
          console.error("Erro ao carregar dados:", err);
          setError("Erro ao carregar dados");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, logout]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        tenant_id:
          formData.role === "adminMaster"
            ? []
            : formData.role === "medico"
              ? formData.tenant_id
              : formData.tenant_id[0],
        confirmarSenha: undefined,
        especialidades: formData.especialidades.map((id) => ({ _id: id })),
      };

      if (id) {
        await api.put(`/usuarios/${id}`, payload);
        setSuccess("Usuário atualizado com sucesso!");
      } else {
        await api.post("/usuarios", payload);
        setSuccess("Usuário criado com sucesso!");
      }

      setTimeout(() => navigate("/usuarios"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.erro || err.message || "Erro ao salvar usuário",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">
            Carregando dados do usuário...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/adminmaster/usuarios")}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <IoArrowBack className="text-xl" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {id ? "Editar Usuário" : "Novo Usuário"}
              </h1>
              <p className="text-slate-500 mt-1">
                {id
                  ? "Atualize as informações do usuário"
                  : "Cadastre um novo usuário no sistema"}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <FiCheckCircle className="text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Informações do Usuário
                </h2>
                <p className="text-sm text-slate-500">
                  Preencha os dados do usuário
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {id ? "Nova Senha" : "Senha"}{" "}
                  {!id && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  required={!id}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {id ? "Confirmar Nova Senha" : "Confirmar Senha"}{" "}
                  {!id && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  required={!id}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Função <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Selecione uma função</option>
                  <option value="medico">Médico</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Admin</option>
                  <option value="adminMaster">Admin Master</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Empresa{" "}
                  {formData.role !== "adminMaster" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {formData.role !== "adminMaster" ? (
                  <Select
                    isMulti={formData.role === "medico"}
                    name="tenant_id"
                    options={tenants.map((tenant) => ({
                      value: tenant._id,
                      label: tenant.nomeFantasia,
                    }))}
                    className="basic-multi-select text-slate-800"
                    classNamePrefix="select"
                    onChange={(selectedOptions) => {
                      const newTenantIds = Array.isArray(selectedOptions)
                        ? selectedOptions.map((option) => option.value)
                        : selectedOptions
                          ? [selectedOptions.value]
                          : [];
                      setFormData((prev) => ({
                        ...prev,
                        tenant_id: newTenantIds,
                      }));
                    }}
                    value={tenants
                      .filter(
                        (tenant) =>
                          Array.isArray(formData.tenant_id) &&
                          formData.tenant_id.includes(tenant._id),
                      )
                      .map((tenant) => ({
                        value: tenant._id,
                        label: tenant.nomeFantasia,
                      }))}
                  />
                ) : (
                  <p className="text-sm text-slate-500 italic py-2">
                    Não aplicável para Admin Master
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Status do Usuário
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="ativo"
                      value="true"
                      checked={formData.ativo === true}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, ativo: true }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.ativo === true
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.ativo === true && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        formData.ativo === true
                          ? "text-green-700"
                          : "text-slate-600"
                      }`}
                    >
                      Ativo
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="ativo"
                      value="false"
                      checked={formData.ativo === false}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, ativo: false }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.ativo === false
                          ? "border-red-500 bg-red-500"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.ativo === false && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        formData.ativo === false
                          ? "text-red-700"
                          : "text-slate-600"
                      }`}
                    >
                      Inativo
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  Usuários inativos não conseguem fazer login no sistema
                </p>
              </div>

              {/* Permissão Financeira */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Permissão Financeira
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="permissaoFinanceiro"
                      value="true"
                      checked={formData.permissaoFinanceiro === true}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissaoFinanceiro: true,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.permissaoFinanceiro === true
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.permissaoFinanceiro === true && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        formData.permissaoFinanceiro === true
                          ? "text-green-700"
                          : "text-slate-600"
                      }`}
                    >
                      Permitir
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="permissaoFinanceiro"
                      value="false"
                      checked={formData.permissaoFinanceiro === false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissaoFinanceiro: false,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.permissaoFinanceiro === false
                          ? "border-red-500 bg-red-500"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.permissaoFinanceiro === false && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        formData.permissaoFinanceiro === false
                          ? "text-red-700"
                          : "text-slate-600"
                      }`}
                    >
                      Negar
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  Permite que o usuário acesse módulos financeiros, incluindo
                  relatórios de pagamentos e configuração de valores
                </p>
              </div>

              {formData.role === "medico" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      CRM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="crm"
                      value={formData.crm}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      required={formData.role === "medico"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Especialidades <span className="text-red-500">*</span>
                    </label>
                    <Select
                      isMulti
                      name="especialidades"
                      options={especialidades.map((especialidade) => ({
                        value: especialidade._id,
                        label: especialidade.nome,
                      }))}
                      value={formData.especialidades
                        .map((espId) => {
                          const esp = especialidades.find(
                            (e) => e._id === espId,
                          );
                          return esp
                            ? { value: esp._id, label: esp.nome }
                            : null;
                        })
                        .filter(Boolean)}
                      onChange={(selectedOptions) =>
                        setFormData((prev) => ({
                          ...prev,
                          especialidades: selectedOptions
                            ? selectedOptions.map((option) => option.value)
                            : [],
                        }))
                      }
                      className="basic-multi-select"
                      classNamePrefix="select"
                      isLoading={loading}
                      placeholder="Selecione as especialidades"
                      noOptionsMessage={() =>
                        "Nenhuma especialidade encontrada"
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/adminmaster/usuarios")}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg font-medium shadow-sm transition-all duration-200 ${
                loading ? "opacity-75 cursor-not-allowed" : "hover:bg-slate-700"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : id ? (
                "Atualizar Usuário"
              ) : (
                "Criar Usuário"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
