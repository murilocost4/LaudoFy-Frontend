import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  FiAlertCircle,
  FiCalendar,
  FiFileText,
  FiUser,
  FiTrendingUp,
  FiPieChart,
  FiClock,
  FiCheckCircle,
  FiBarChart2,
  FiDatabase,
  FiActivity,
  FiPlus,
  FiArrowRight,
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiBell,
  FiSettings,
  FiMessageSquare,
  FiHelpCircle,
  FiClipboard,
  FiStar,
  FiAward,
  FiTarget,
  FiZap,
  FiLayers,
  FiMonitor,
  FiTrendingDown,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

// Loading otimizado
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center p-20">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent"></div>
      <p className="text-slate-600 text-lg font-medium mt-4">
        Carregando dashboard...
      </p>
    </div>
  );
});

// Componente de Card de Estatística otimizado
const StatCard = memo(function StatCard({ stat, index }) {
  return (
    <div
      className={`${stat.bg} rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group overflow-hidden relative`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
            {stat.title}
          </p>
          <p className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</p>
          <div className="flex items-center space-x-2">
            <div className={`p-1 bg-gradient-to-r ${stat.gradient} rounded-full`}>
              <stat.icon className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-500">{stat.subtitle}</span>
          </div>
        </div>
        <div
          className={`p-4 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}
        >
          <stat.icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="mt-4 h-2 w-full bg-slate-100 overflow-hidden rounded-full">
        <div
          className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-500 ease-out`}
          style={{ width: `${stat.percentage || 100}%` }}
        ></div>
      </div>
    </div>
  );
});

// Card de Ação Rápida otimizado
const QuickActionCard = memo(function QuickActionCard({ action, onClick }) {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-4 rounded-xl bg-gradient-to-r ${action.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}
          >
            <action.icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-slate-600">{action.subtitle}</p>
          </div>
        </div>
        <FiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  );
});

// Card de Exame Recente otimizado
const ExameCard = memo(function ExameCard({ exame, onClick }) {
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Pendente":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Concluído":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  }, []);

  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer transition-all duration-200 group"
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <FiUser className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {exame.paciente?.nome || "Não informado"}
            </div>
            <div className="text-xs text-slate-500">
              {exame.paciente?.idade
                ? `${exame.paciente.idade} anos`
                : "Idade não informada"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-800">
          {exame.tipoExame?.nome || exame.tipoExame || "Não informado"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(exame.status)}`}
        >
          {exame.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-800">
          {exame.dataExame ? (
            format(parseISO(exame.dataExame), "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span className="text-slate-400">Não informado</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        {exame.tecnico?.nome || "Não atribuído"}
      </td>
    </tr>
  );
});

// Card de Notificação otimizado
const NotificationCard = memo(function NotificationCard({ notification }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-full ${notification.bgColor} ${notification.iconColor} group-hover:scale-110 transition-transform duration-200`}
        >
          <notification.icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            {notification.title}
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            {notification.description}
          </p>
        </div>
      </div>
    </div>
  );
});

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [tiposExames, setTiposExames] = useState([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState([]);
  const [examesRecentes, setExamesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const COLORS = useMemo(
    () => ({
      primary: "#475569", // slate-600
      primaryLight: "#94A3B8", // slate-400
      primaryDark: "#1E293B", // slate-800
      secondary: "#10B981", // emerald-500
      accent: "#6366F1", // indigo-500
      warning: "#F59E0B", // amber-500
      danger: "#EF4444", // red-500
      background: "#F8FAFC", // slate-50
      cardBg: "#FFFFFF", // white
      text: "#1E293B", // slate-800
      muted: "#64748B", // slate-500
      border: "#E2E8F0", // slate-200
    }),
    [],
  );

  const chartColors = useMemo(
    () => ["#475569", "#1E293B", "#10B981", "#6366F1", "#F59E0B", "#EF4444"],
    [],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Não autenticado");
      }

      const [statsRes, tiposRes, evolucaoRes, recentesRes] = await Promise.all([
        api.get("/estatisticas/estatisticas"),
        api.get("/estatisticas/tipos-exames"),
        api.get("/estatisticas/evolucao-mensal"),
        api.get("/exames?limit=5&sort=-createdAt"),
      ]);

      setStats(statsRes.data);
      setTiposExames(tiposRes.data);
      setEvolucaoMensal(
        evolucaoRes.data.map((item) => ({
          mes: format(new Date(item._id.year, item._id.month - 1), "MMM/yy", {
            locale: ptBR,
          }),
          total: item.total,
          concluidos: item.concluidos,
        })),
      );
      setExamesRecentes(recentesRes.data.exames);
    } catch (err) {
      console.error("Erro no dashboard");

      if (err.response?.status === 401 || err.message === "Não autenticado") {
        setError("Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else {
        setError("Erro ao carregar dados do dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configuração dos cards de estatística
  const statsConfig = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total de Exames",
        value: stats.totalExames?.toLocaleString("pt-BR") || "0",
        icon: FiDatabase,
        gradient: "from-slate-600 to-slate-800",
        bg: "bg-slate-50",
        subtitle: "Exames registrados",
        percentage: 100,
      },
      {
        title: "Pendentes",
        value: stats.examesPendentes?.toLocaleString("pt-BR") || "0",
        icon: FiClock,
        gradient: "from-amber-500 to-amber-600",
        bg: "bg-amber-50",
        subtitle: "Aguardando análise",
        percentage:
          stats.totalExames > 0
            ? (stats.examesPendentes / stats.totalExames) * 100
            : 0,
      },
      {
        title: "Concluídos",
        value: stats.examesFinalizados?.toLocaleString("pt-BR") || "0",
        icon: FiCheckCircle,
        gradient: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50",
        subtitle: "Exames finalizados",
        percentage:
          stats.totalExames > 0
            ? (stats.examesFinalizados / stats.totalExames) * 100
            : 0,
      },
      {
        title: "Eficiência",
        value:
          stats.totalExames > 0
            ? `${Math.round((stats.examesFinalizados / stats.totalExames) * 100)}%`
            : "0%",
        icon: FiTrendingUp,
        gradient: "from-blue-600 to-indigo-600",
        bg: "bg-blue-50",
        subtitle: "Taxa de conclusão",
        percentage:
          stats.totalExames > 0
            ? (stats.examesFinalizados / stats.totalExames) * 100
            : 0,
      },
    ];
  }, [stats]);

  // Configuração das ações rápidas
  const quickActions = useMemo(() => {
    const actions = [
      {
        title: "Novo Exame",
        subtitle: "Registrar novo exame",
        icon: FiPlus,
        gradient: "from-slate-600 to-slate-800",
        onClick: () => navigate("/exames/novo"),
      },
      {
        title: "Novo Paciente",
        subtitle: "Cadastrar paciente",
        icon: FiUser,
        gradient: "from-emerald-600 to-emerald-700",
        onClick: () => navigate("/pacientes/novo"),
      },
    ];

    if (usuario.role === "admin") {
      actions.push(
        {
          title: "Gerenciar Usuários",
          subtitle: "Controle de acesso",
          icon: FiUsers,
          gradient: "from-blue-600 to-indigo-600",
          onClick: () => navigate("/usuarios"),
        },
        {
          title: "Relatórios",
          subtitle: "Gerar análises",
          icon: FiPieChart,
          gradient: "from-amber-600 to-orange-600",
          onClick: () => navigate("/relatorios"),
        },
      );
    }

    if (["medico", "tecnico"].includes(usuario.role)) {
      actions.push({
        title: "Ver Laudos",
        subtitle: "Acessar relatórios médicos",
        icon: FiClipboard,
        gradient: "from-teal-600 to-cyan-600",
        onClick: () => navigate("/laudos"),
      });
    }

    return actions;
  }, [usuario.role, navigate]);

  // Configuração das notificações
  const notifications = useMemo(
    () => [
      {
        title: "Exames Pendentes",
        description: `Você tem ${stats?.examesPendentes || 0} exames aguardando análise`,
        icon: FiAlertTriangle,
        bgColor: "bg-red-100",
        iconColor: "text-red-500",
      },
      {
        title: "Atualização do Sistema",
        description: "Sistema atualizado conforme demanda",
        icon: FiMessageSquare,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-500",
      },
      {
        title: "Dica do Dia",
        description:
          "Sempre verifique os dados do paciente antes de registrar um exame",
        icon: FiHeart,
        bgColor: "bg-green-100",
        iconColor: "text-green-500",
      },
      {
        title: "Precisa de Ajuda?",
        description:
          "Consulte nossa documentação ou entre em contato com o suporte",
        icon: FiHelpCircle,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-500",
      },
    ],
    [stats?.examesPendentes],
  );

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <div className="text-red-500 text-center py-8 flex flex-col items-center">
              <FiAlertCircle className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Erro no Sistema</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl shadow-lg">
                <FiMonitor className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 flex items-center space-x-2">
                  <FiAward className="h-4 w-4 text-slate-500" />
                  <span>Visão geral do sistema médico</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-lg font-medium transition-all duration-200 shadow-md disabled:opacity-70"
              >
                <FiActivity
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Cards Estatísticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg">
              <FiZap className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                action={action}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição de Tipos */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg">
                  <FiPieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Distribuição por Tipo
                  </h3>
                  <p className="text-sm text-slate-600">Por tipo de exame</p>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tiposExames}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    label={({ _id, percent }) =>
                      `${_id} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {tiposExames.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} exames`, "Quantidade"]}
                    labelFormatter={(label) => `Tipo: ${label}`}
                    contentStyle={{
                      background: COLORS.cardBg,
                      borderColor: COLORS.border,
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      paddingLeft: "20px",
                      fontSize: "12px",
                      color: COLORS.text,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evolução Mensal */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg">
                  <FiActivity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Evolução Mensal
                  </h3>
                  <p className="text-sm text-gray-600">Últimos 12 meses</p>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis
                    dataKey="mes"
                    stroke={COLORS.muted}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke={COLORS.muted} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value} exames`, "Quantidade"]}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{
                      background: COLORS.cardBg,
                      borderColor: COLORS.border,
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      color: COLORS.text,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total de Exames"
                    stroke={COLORS.primaryDark}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      stroke: COLORS.primaryDark,
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                    activeDot={{ r: 7, fill: COLORS.primaryDark }}
                  />
                  <Line
                    type="monotone"
                    dataKey="concluidos"
                    name="Exames Concluídos"
                    stroke={COLORS.secondary}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      stroke: COLORS.secondary,
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                    activeDot={{ r: 7, fill: COLORS.secondary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabela de Exames Recentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                    <FiFileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Exames Recentes
                    </h3>
                    <p className="text-sm text-gray-600">
                      Últimos 5 exames registrados
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/exames")}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <span>Ver todos</span>
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Técnico
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examesRecentes.length > 0 ? (
                    examesRecentes.map((exame) => (
                      <ExameCard
                        key={exame._id}
                        exame={exame}
                        onClick={() => navigate(`/exames/${exame._id}`)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <FiFileText className="h-12 w-12 text-gray-400" />
                          <p className="text-gray-500">
                            Nenhum exame encontrado
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seção de Notificações */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg">
                  <FiBell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Avisos & Alertas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Informações importantes
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {notifications.map((notification, index) => (
                <NotificationCard key={index} notification={notification} />
              ))}
            </div>
          </div>
        </div>

        {/* Estilo personalizado */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Dashboard;
