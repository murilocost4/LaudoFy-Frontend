import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { toast } from 'react-hot-toast';
import {
  FaCertificate,
  FaUpload,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaClock,
  FaEye,
  FaTrash,
  FaShieldAlt,
  FaCalendarAlt,
  FaFileUpload,
  FaKey,
  FaDownload,
  FaInfoCircle
} from 'react-icons/fa';

const GerenciarCertificados = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCertificado, setSelectedCertificado] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [senha, setSenha] = useState('');
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    carregarCertificados();
  }, []);

  const carregarCertificados = async () => {
    try {
      const response = await api.get('/certificados/meus');
      setCertificados(response.data.certificados);
    } catch (error) {
      console.error('Erro ao carregar certificados:');
      toast.error('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCertificado = async (e) => {
    e.preventDefault();
    
    if (!arquivo || !senha) {
      toast.error('Selecione um arquivo e informe a senha');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('certificado', arquivo);
      formData.append('senha', senha);

      const response = await api.post('/certificados/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Certificado cadastrado com sucesso!');
      setShowUploadModal(false);
      setArquivo(null);
      setSenha('');
      carregarCertificados();
    } catch (error) {
      console.error('Erro ao fazer upload');
      const mensagem = error.response?.data?.erro || 'Erro ao cadastrar certificado';
      toast.error(mensagem);
    } finally {
      setUploading(false);
    }
  };

  const handleAlterarStatus = async (certificadoId, novoStatus) => {
    try {
      await api.patch(`/certificados/meus/${certificadoId}/status`, {
        ativo: novoStatus
      });
      
      toast.success(`Certificado ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      carregarCertificados();
    } catch (error) {
      console.error('Erro ao alterar status');
      const mensagem = error.response?.data?.erro || 'Erro ao alterar status do certificado';
      toast.error(mensagem);
    }
  };

  const handleRemoverCertificado = async (certificadoId) => {
    if (!window.confirm('Tem certeza que deseja remover este certificado? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/certificados/meus/${certificadoId}`);
      toast.success('Certificado removido com sucesso!');
      carregarCertificados();
    } catch (error) {
      console.error('Erro ao remover certificado');
      const mensagem = error.response?.data?.erro || 'Erro ao remover certificado';
      toast.error(mensagem);
    }
  };

  const handleVerDetalhes = async (certificadoId) => {
    try {
      const response = await api.get(`/certificados/meus/${certificadoId}`);
      setSelectedCertificado(response.data.certificado);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes');
      toast.error('Erro ao carregar detalhes do certificado');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <FaCheck className="w-3 h-3" />,
        text: 'Ativo'
      },
      vencido: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <FaTimes className="w-3 h-3" />,
        text: 'Vencido'
      },
      proximo_vencimento: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <FaExclamationTriangle className="w-3 h-3" />,
        text: 'Próximo ao vencimento'
      },
      inativo: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: <FaClock className="w-3 h-3" />,
        text: 'Inativo'
      },
      pendente_validacao: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <FaClock className="w-3 h-3" />,
        text: 'Pendente validação'
      }
    };

    const config = statusConfig[status] || statusConfig.inativo;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularDiasVencimento = (dataVencimento) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FaCertificate className="w-6 h-6 text-slate-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Certificados Digitais
                </h1>
              </div>
              <p className="text-slate-600">
                Gerencie seus certificados digitais para assinatura de laudos
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors shadow-sm"
            >
              <FaUpload className="w-4 h-4" />
              Novo Certificado
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        {estatisticas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total de Certificados</p>
                  <p className="text-2xl font-bold text-slate-800">{estatisticas.totalCertificados}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <FaCertificate className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Certificados Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.certificadosAtivos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total de Assinaturas</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.totalAssinaturas}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaShieldAlt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Próximos ao Vencimento</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.proximosVencimento}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alertas */}
        {estatisticas?.alertas && estatisticas.alertas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">Certificados próximos ao vencimento</h3>
                <div className="space-y-2">
                  {estatisticas.alertas.map((alerta, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      <strong>{alerta.nome}</strong> vence em {alerta.diasRestantes} dias ({formatarData(alerta.dataVencimento)})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista de Certificados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Meus Certificados</h2>
          </div>

          {certificados.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
                <FaCertificate className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum certificado cadastrado</h3>
              <p className="text-slate-500 mb-6">Cadastre seu primeiro certificado digital para começar a assinar laudos</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cadastrar Certificado
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Certificado</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Emissor</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Vencimento</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Assinaturas</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {certificados.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-slate-800">{cert.nomeCertificado}</div>
                          <div className="text-sm text-slate-500">
                            Cadastrado em {formatarData(cert.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">{cert.emissor}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm text-slate-800">{formatarData(cert.dataVencimento)}</div>
                          <div className={`text-xs ${
                            cert.diasVencimento <= 30 ? 'text-red-600' : 
                            cert.diasVencimento <= 90 ? 'text-yellow-600' : 'text-slate-500'
                          }`}>
                            {cert.diasVencimento > 0 ? `${cert.diasVencimento} dias` : 'Vencido'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(cert.status)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">{cert.totalAssinaturas}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerDetalhes(cert.id)}
                            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          
                          {cert.status !== 'vencido' && (
                            <button
                              onClick={() => handleAlterarStatus(cert.id, !cert.ativo)}
                              className={`p-2 rounded-lg transition-colors ${
                                cert.ativo 
                                  ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              }`}
                              title={cert.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {cert.ativo ? <FaTimes className="w-4 h-4" /> : <FaCheck className="w-4 h-4" />}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoverCertificado(cert.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Upload */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm backdrop-brightness-50 bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FaUpload className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Novo Certificado</h3>
              </div>

              <form onSubmit={handleUploadCertificado} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Arquivo do Certificado (.pfx ou .p12)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={(e) => setArquivo(e.target.files[0])}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {arquivo && (
                    <div className="mt-2 text-sm text-slate-600">
                      Arquivo selecionado: {arquivo.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Senha do Certificado
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Digite a senha do certificado"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Informações importantes:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Apenas arquivos .pfx ou .p12 são aceitos</li>
                        <li>• O certificado deve estar válido</li>
                        <li>• A senha será criptografada e armazenada com segurança</li>
                        <li>• Você pode ter apenas um certificado ativo por vez</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setArquivo(null);
                      setSenha('');
                    }}
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !arquivo || !senha}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <FaUpload className="w-4 h-4" />
                        Cadastrar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {showDetailsModal && selectedCertificado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm backdrop-brightness-50 bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FaCertificate className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Detalhes do Certificado</h3>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Status:</span>
                  {getStatusBadge(selectedCertificado.status)}
                </div>

                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Certificado</label>
                    <p className="text-slate-800">{selectedCertificado.nomeCertificado}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Emissor</label>
                    <p className="text-slate-800">{selectedCertificado.emissor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número de Série</label>
                    <p className="text-slate-800 font-mono text-sm">{selectedCertificado.numeroSerie}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Algoritmo</label>
                    <p className="text-slate-800">{selectedCertificado.algoritmoAssinatura}</p>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Emissão</label>
                    <p className="text-slate-800">{formatarData(selectedCertificado.dataEmissao)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                    <p className={`font-medium ${
                      selectedCertificado.diasVencimento <= 30 ? 'text-red-600' : 
                      selectedCertificado.diasVencimento <= 90 ? 'text-yellow-600' : 'text-slate-800'
                    }`}>
                      {formatarData(selectedCertificado.dataVencimento)}
                      <span className="text-sm text-slate-500 ml-2">
                        ({selectedCertificado.diasVencimento > 0 ? `${selectedCertificado.diasVencimento} dias` : 'Vencido'})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Estatísticas de uso */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCertificado.totalAssinaturas}</div>
                    <div className="text-sm text-blue-700">Total de Assinaturas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCertificado.tamanhoChave}</div>
                    <div className="text-sm text-green-700">Tamanho da Chave (bits)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">
                      {selectedCertificado.ultimoUso ? formatarData(selectedCertificado.ultimoUso) : 'Nunca usado'}
                    </div>
                    <div className="text-sm text-purple-700">Último Uso</div>
                  </div>
                </div>

                {/* Informações técnicas */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-700 mb-3">Informações Técnicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Cadastrado em:</span>
                      <span className="ml-2 text-slate-800">{formatarData(selectedCertificado.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Última atualização:</span>
                      <span className="ml-2 text-slate-800">{formatarData(selectedCertificado.updatedAt)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Validado:</span>
                      <span className="ml-2 text-slate-800">
                        {selectedCertificado.validado ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Ativo:</span>
                      <span className="ml-2 text-slate-800">
                        {selectedCertificado.ativo ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GerenciarCertificados;
