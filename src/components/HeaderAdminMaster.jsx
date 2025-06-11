import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSidebarAdminMaster } from "../contexts/SidebarAdminMasterContext";
import { FiLogOut, FiMenu, FiInfo } from "react-icons/fi";
import Modal from "react-modal";

// Modal styles
const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: "none",
    borderRadius: "8px",
    padding: "0",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    maxWidth: "90vw",
    width: "600px",
    maxHeight: "90vh",
  },
};

Modal.setAppElement("#root");

const HeaderAdminMaster = () => {
  const { usuario, logout } = useAuth();
  const { toggle: toggleSidebarAdminMaster } = useSidebarAdminMaster();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900 shadow-lg z-50">
      <div className="mx-auto px-6 flex justify-between items-center h-16">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebarAdminMaster}
            className="text-slate-400 hover:text-white transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              <span className="font-black">LAUDO</span>
              <span className="text-slate-400">FY</span>
              <span className="text-sm font-medium ml-2 text-slate-400">
                ADMIN
              </span>
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Help/Documentation Button */}
          <button
            onClick={openModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
            aria-label="System Documentation"
          >
            <FiInfo className="h-5 w-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white">
                    {usuario?.nome}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    Admin Master
                  </p>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 border border-slate-200">
                <div className="px-4 py-2 text-sm text-slate-600 border-b border-slate-200">
                  Logged in as{" "}
                  <span className="font-medium text-slate-900">
                    {usuario?.email}
                  </span>
                </div>
                <div>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition-colors duration-200"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="System Documentation"
          shouldCloseOnOverlayClick={true}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold text-white">
                Admin Documentation
              </h2>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">
                    🛠️ Admin Master Features
                  </h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Manage multiple clinics and organizations</li>
                    <li>• Create and configure new tenants</li>
                    <li>• Monitor system usage and performance</li>
                    <li>• Access advanced security settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">
                    ⚡ Quick Actions
                  </h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Add new clinic</li>
                    <li>• Manage user permissions</li>
                    <li>• View system logs</li>
                    <li>• Configure global settings</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                🔐 <strong>Admin Support:</strong> For urgent assistance,
                contact the development team at dev@fytenza.com.br
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </header>
  );
};

export default HeaderAdminMaster;
