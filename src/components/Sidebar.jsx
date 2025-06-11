import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiUser,
  FiPieChart,
  FiDatabase,
  FiX,
  FiLogOut,
  FiPlusCircle,
  FiActivity,
  FiClipboard,
  FiChevronDown,
  FiChevronRight,
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiShield,
} from "react-icons/fi";

const Sidebar = () => {
  const { usuario, logout, permissaoFinanceiro, isAdminMaster } = useAuth();
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  // Grupos de menus para melhor organização
  const menuGroups = [
    {
      title: "Principal",
      items: [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        {
          path: "/exames",
          icon: FiFileText,
          label: "Exames",
          roles: ["tecnico", "medico", "admin", "recepcionista"],
        },
        {
          path: "/laudos",
          icon: FiClipboard,
          label: "Laudos",
          roles: ["tecnico", "medico", "admin", "recepcionista"],
        },
        { path: "/pacientes", icon: FiUsers, label: "Pacientes" },
        {
          path: "/meus-pagamentos",
          icon: FiCreditCard,
          label: "Meus Pagamentos",
          roles: ["medico"],
        },
        {
          path: "/certificados",
          icon: FiShield,
          label: "Certificados Digitais",
          roles: ["medico"],
        },
      ],
    },
    {
      title: "Gerenciamento",
      items: [
        {
          path: "/usuarios",
          icon: FiUser,
          label: "Usuários",
          roles: ["admin"],
        },
        {
          path: "/relatorios",
          icon: FiPieChart,
          label: "Relatórios",
          roles: ["admin", "recepcionista"],
        },
        {
          path: "/auditoria",
          icon: FiDatabase,
          label: "Logs de Auditoria",
          roles: ["admin"],
        },
      ],
      roles: ["admin", "recepcionista"],
    },
    {
      title: "Financeiro",
      items: [
        {
          path: "/financeiro/pagamentos",
          icon: FiDollarSign,
          label: "Registrar Pagamentos",
        },
        {
          path: "/financeiro/configurar-valores",
          icon: FiCreditCard,
          label: "Configurar Valores",
        },
        {
          path: "/financeiro/historico-pagamentos",
          icon: FiCalendar,
          label: "Histórico de Pagamentos",
        },
      ],
      requirePermission: "financeiro",
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar modernizado com tema slate */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 md:z-30 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)] border-r border-slate-200`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                  <span className="text-lg font-semibold text-white">
                    {usuario?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {usuario?.nome}
                  </h3>
                  <p className="text-sm text-slate-600 capitalize">
                    {usuario?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-8">
            {menuGroups.map((group, index) => {
              // Verifica se o grupo deve ser exibido baseado nas roles
              if (
                group.roles &&
                !group.roles.some((role) => usuario?.role === role)
              ) {
                return null;
              }

              // Verifica permissão financeira se o grupo requerer
              if (
                group.requirePermission === "financeiro" &&
                !permissaoFinanceiro &&
                !isAdminMaster
              ) {
                return null;
              }

              const hasVisibleItems = group.items.some(
                (item) =>
                  !item.roles ||
                  item.roles.some((role) => usuario?.role === role),
              );

              if (!hasVisibleItems) {
                return null;
              }

              return (
                <div key={`group-${index}`}>
                  <h3 className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    {group.title}
                  </h3>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      if (
                        item.roles &&
                        !item.roles.some((role) => usuario?.role === role)
                      ) {
                        return null;
                      }

                      const active = isActive(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={close}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                            active
                              ? "bg-slate-100 text-slate-900 border-l-4 border-slate-600 shadow-sm"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <item.icon
                            className={`flex-shrink-0 w-5 h-5 transition-colors ${
                              active
                                ? "text-slate-600"
                                : "text-slate-500 group-hover:text-slate-600"
                            }`}
                          />
                          <span>{item.label}</span>
                          {active ? (
                            <FiChevronDown className="ml-auto text-slate-600" />
                          ) : (
                            <FiChevronRight className="ml-auto text-slate-400 group-hover:text-slate-600" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => {
                close();
                logout();
              }}
              className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
