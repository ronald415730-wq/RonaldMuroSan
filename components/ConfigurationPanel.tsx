
import React, { useRef, useState } from "react";
import { DikeConfig, Sector, ProjectBackup } from "../types";
import { Table, FileSpreadsheet, Download, Upload, Save, HardDrive, Copy, Plus, Edit2, Check, X, Trash2, FolderPlus, Settings, AlertTriangle, CheckCircle, Info, Columns, Play, Sparkles, FileText } from "lucide-react";
import { Button } from "./Button";

interface ConfigurationPanelProps {
  sectors: Sector[];
  dikes: DikeConfig[];
  customColumns: string[];
  onRestore: (data: ProjectBackup) => void;
  onBackup?: () => void;
  onDuplicate?: (sourceId: string, newName: string, newSectorId: string) => void;
  onAddSector: (sector: Sector) => void;
  onUpdateSector: (sector: Sector) => void;
  onDeleteSector: (id: string) => void;
  onAddDike: (dike: DikeConfig) => void;
  onUpdateDike: (dike: DikeConfig) => void;
  onDeleteDike: (id: string) => void;
  onAddColumn: (name: string) => void;
  onDeleteColumn: (name: string) => void;
  onGenerateExercise?: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  sectors, 
  dikes, 
  customColumns,
  onRestore,
  onBackup,
  onDuplicate,
  onAddSector,
  onUpdateSector,
  onDeleteSector,
  onAddDike,
  onUpdateDike,
  onDeleteDike,
  onAddColumn,
  onDeleteColumn,
  onGenerateExercise
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DikeConfig | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  
  // Custom Columns Local State
  const [newColName, setNewColName] = useState("");

  // Helper for Validation
  const parsePk = (val: string) => {
    if (!val) return 0;
    const clean = val.toString().replace(/\s/g, '');
    if (clean.includes('+')) {
        const [km, m] = clean.split('+');
        return (parseFloat(km) * 1000) + parseFloat(m);
    }
    return parseFloat(clean) || 0;
  };

  const getDikeValidation = (dike: DikeConfig) => {
      const errors: string[] = [];
      const idDupes = dikes.filter(d => d.id === dike.id).length;
      if (idDupes > 1) errors.push("ID Duplicado");

      const nameDupes = dikes.filter(d => d.name === dike.name).length;
      if (nameDupes > 1) errors.push("Nombre Duplicado");

      const start = parsePk(dike.progInicioDique);
      const end = parsePk(dike.progFinDique);
      const calcLen = Math.abs(end - start);
      const diff = Math.abs(calcLen - dike.totalML);
      
      if (dike.totalML <= 0) {
          errors.push("Longitud Total es 0 o negativa");
      } else if (diff > 1) { 
          errors.push(`Inconsistencia: Calc(${calcLen.toFixed(2)}) vs Total(${dike.totalML})`);
      }

      return { isValid: errors.length === 0, errors };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onRestore(json);
      } catch (err) {
        alert("Error al leer el archivo de respaldo.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- FUNCIÓN DE EXPORTACIÓN DE DIQUES A CSV ---
  const handleExportDikesCSV = () => {
    const headers = [
        "Sector ID", 
        "Nombre Sector", 
        "ID Dique", 
        "Nombre Dique", 
        "Prog Rio Inicio", 
        "Prog Rio Fin", 
        "Prog Dique Inicio", 
        "Prog Dique Fin", 
        "Total ML"
    ];
    
    const rows = dikes.map(dike => {
      const sector = sectors.find(s => s.id === dike.sectorId);
      return [
        dike.sectorId,
        sector?.name || "Desconocido",
        dike.id,
        dike.name,
        dike.progInicioRio,
        dike.progFinRio,
        dike.progInicioDique,
        dike.progFinDique,
        dike.totalML.toString()
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Agregar BOM para UTF-8 (soporte para tildes en Excel)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CONFIG_DIQUES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDuplicateClick = (dike: DikeConfig) => {
      if (!onDuplicate) return;
      
      const newName = prompt(`Ingrese el nombre para la copia de "${dike.name}":`, `${dike.name} (Copia)`);
      if (!newName) return;

      const sectorList = sectors.map(s => s.id).join(", ");
      const newSectorId = prompt(`Ingrese el ID del Sector para el nuevo dique (${sectorList}):`, dike.sectorId);
      
      if (newSectorId) {
          onDuplicate(dike.id, newName, newSectorId);
      }
  };

  const handleCreateSector = () => {
    const name = prompt("Ingrese el nombre del Nuevo Sector:");
    if (!name || !name.trim()) return;
    
    const defaultId = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const id = prompt("Ingrese el ID del Nuevo Sector (único):", defaultId);
    
    if (!id || !id.trim()) return;
    const finalId = id.trim().toUpperCase();

    if (sectors.some(s => s.id === finalId)) {
        alert("Este ID de sector ya existe.");
        return;
    }

    onAddSector({ id: finalId, name: name.trim() });
  };

  const handleCreateDikeInSector = (sectorId: string) => {
    const newId = `DIQUE_${Date.now()}`;
    const newDike: DikeConfig = {
        id: newId,
        sectorId: sectorId,
        name: "NUEVO DIQUE",
        progInicioRio: "0+000",
        progFinRio: "0+000",
        progInicioDique: "0+000",
        progFinDique: "0+000",
        totalML: 0
    };

    onAddDike(newDike);
    setEditingId(newId);
    setEditForm(newDike);
  };

  const startEdit = (dike: DikeConfig) => {
    setEditingId(dike.id);
    setEditForm({ ...dike });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
       onUpdateDike(editForm);
       setEditingId(null);
       setEditForm(null);
    }
  };

  const handleEditChange = (field: keyof DikeConfig, value: string | number) => {
      if (!editForm) return;
      setEditForm({ ...editForm, [field]: value });
  };

  const handleAddColumnLocal = () => {
      const name = newColName.trim();
      if (!name) return;
      if (customColumns.includes(name)) {
          alert("Esta columna ya existe.");
          return;
      }
      onAddColumn(name);
      setNewColName("");
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Data Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100">Centro de Respaldo</h2>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2 flex-1">
                <Button onClick={onBackup} className="w-full justify-center text-xs h-9 bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Download className="w-4 h-4 mr-2" /> Backup Total (.json)
                </Button>
                {/* BOTÓN NUEVO: EXPORTAR DIQUES A CSV */}
                <Button 
                    onClick={handleExportDikesCSV} 
                    variant="outline" 
                    className="w-full justify-center text-xs h-9 bg-white dark:bg-gray-800 text-green-700 border-green-200 hover:bg-green-50 shadow-sm font-bold"
                >
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Diques (CSV)
                </Button>
                <div className="w-full relative">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".json" 
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-center text-xs h-9 bg-white dark:bg-gray-800">
                        <Upload className="w-4 h-4 mr-2" /> Restaurar Sistema
                    </Button>
                </div>
            </div>
          </div>

          {/* Quick Actions / Exercise Generation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">Ejercicio de Llenado</h2>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center gap-3">
                <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center italic">
                    Genera automáticamente metrados y avance diario para todos los diques configurados.
                </p>
                <Button onClick={onGenerateExercise} className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white font-bold border-0 shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                    <Play className="w-4 h-4 mr-2" /> EJECUTAR EJERCICIO MASIVO
                </Button>
            </div>
          </div>

          {/* Custom Columns Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h2 className="text-base font-semibold text-purple-900 dark:text-purple-100">Atributos Extra</h2>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Nueva columna..."
                        className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-[10px] bg-white dark:bg-gray-900 outline-none"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                    />
                    <Button onClick={handleAddColumnLocal} className="text-xs h-8 px-3 bg-purple-600">
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[60px]">
                    {customColumns.map(col => (
                        <div key={col} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[9px] font-bold">
                            {col}
                            <X className="w-2.5 h-2.5 cursor-pointer text-red-500" onClick={() => onDeleteColumn(col)} />
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </div>

      <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sectores y Diques del Proyecto</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Configure la segmentación geográfica de la obra</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
                onClick={() => setShowValidation(!showValidation)} 
                variant="outline"
                className={`text-xs h-9 px-3 ${showValidation ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}`}
            >
                {showValidation ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />} 
                {showValidation ? "Ocultar Errores" : "Validar Estructura"}
            </Button>
            <Button onClick={handleCreateSector} className="text-xs h-9 px-4 bg-[#003366] hover:bg-[#002244] text-white shadow-sm transition-all hover:scale-105 active:scale-95">
                <FolderPlus className="w-4 h-4 mr-2" /> Crear Nuevo Sector
            </Button>
          </div>
      </div>

      {sectors.map((sector) => (
        <div key={sector.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Sector Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                    <span className="bg-[#003366] text-white text-[10px] font-bold px-2 py-1.5 rounded uppercase tracking-wider">SECTOR</span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{sector.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => {
                            const newName = prompt("Nuevo nombre del sector:", sector.name);
                            if (newName && newName !== sector.name) onUpdateSector({...sector, name: newName});
                        }} 
                        className="text-gray-500 hover:text-blue-600 p-1.5 rounded hover:bg-white transition-colors"
                        title="Editar nombre"
                     >
                        <Edit2 className="w-3.5 h-3.5" />
                     </button>
                     <button 
                        onClick={() => onDeleteSector(sector.id)} 
                        className="text-gray-500 hover:text-red-600 p-1.5 rounded hover:bg-white transition-colors"
                        title="Eliminar sector"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                     <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                     <Button 
                        onClick={() => handleCreateDikeInSector(sector.id)} 
                        className="text-[10px] h-7 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-blue-700 shadow-sm"
                     >
                        <Plus className="w-3 h-3 mr-1.5" /> Agregar Dique
                     </Button>
                </div>
            </div>
            
            {/* Dike Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] text-white uppercase bg-[#003366] border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {showValidation && <th className="px-2 py-1.5 w-8 text-center">Est.</th>}
                    <th className="px-2 py-1.5 border-r border-white/20 font-semibold">Dique / Código</th>
                    <th className="px-2 py-1.5 border-r border-white/20 text-center font-semibold w-24">Prog. Rio<br/>Inicio</th>
                    <th className="px-2 py-1.5 border-r border-white/20 text-center font-semibold w-24">Prog. Rio<br/>Fin</th>
                    <th className="px-2 py-1.5 border-r border-white/20 text-center font-semibold w-24">Prog. Dique<br/>Inicio</th>
                    <th className="px-2 py-1.5 border-r border-white/20 text-center font-semibold w-24">Prog. Dique<br/>Fin</th>
                    <th className="px-2 py-1.5 border-r border-white/20 text-right font-semibold w-20">Total (ML)</th>
                    <th className="px-2 py-1.5 text-center font-semibold w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {dikes.filter(d => d.sectorId === sector.id).map((dike) => {
                    const isEditing = editingId === dike.id;
                    const validation = getDikeValidation(dike);
                    
                    return (
                        <tr key={dike.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-[10px]">
                        
                        {showValidation && (
                            <td className="px-2 py-1 text-center align-middle border-r dark:border-gray-600">
                                {validation.isValid ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500 mx-auto" />
                                ) : (
                                    <div className="group relative inline-block">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 mx-auto cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-black/80 text-white text-[9px] p-2 rounded z-50">
                                            {validation.errors.map((err, i) => <div key={i}>• {err}</div>)}
                                        </div>
                                    </div>
                                )}
                            </td>
                        )}

                        <td className="px-2 py-1 border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] font-bold text-blue-700 h-6"
                                    value={editForm.name}
                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <span className="font-bold text-blue-600 dark:text-blue-400">{dike.name}</span>
                            )}
                        </td>

                        <td className="px-2 py-1 text-center border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] text-center h-6"
                                    value={editForm.progInicioRio}
                                    onChange={(e) => handleEditChange('progInicioRio', e.target.value)}
                                    placeholder="0+000"
                                />
                            ) : <span className="font-mono text-gray-600">{dike.progInicioRio}</span>}
                        </td>
                        <td className="px-2 py-1 text-center border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] text-center h-6"
                                    value={editForm.progFinRio}
                                    onChange={(e) => handleEditChange('progFinRio', e.target.value)}
                                    placeholder="0+000"
                                />
                            ) : <span className="font-mono text-gray-600">{dike.progFinRio}</span>}
                        </td>

                        <td className="px-2 py-1 text-center border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] text-center h-6"
                                    value={editForm.progInicioDique}
                                    onChange={(e) => handleEditChange('progInicioDique', e.target.value)}
                                    placeholder="0+000"
                                />
                            ) : <span className="font-mono text-gray-600">{dike.progInicioDique}</span>}
                        </td>
                        <td className="px-2 py-1 text-center border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] text-center h-6"
                                    value={editForm.progFinDique}
                                    onChange={(e) => handleEditChange('progFinDique', e.target.value)}
                                    placeholder="0+000"
                                />
                            ) : <span className="font-mono text-gray-600">{dike.progFinDique}</span>}
                        </td>

                        <td className="px-2 py-1 text-right border-r dark:border-gray-600 align-middle">
                             {isEditing && editForm ? (
                                <input 
                                    type="number"
                                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 rounded px-1 py-0.5 text-[10px] text-right font-bold h-6"
                                    value={editForm.totalML}
                                    onChange={(e) => handleEditChange('totalML', parseFloat(e.target.value))}
                                />
                            ) : (
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                                    validation.isValid || !showValidation 
                                    ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
                                    : 'bg-red-50 text-red-600'
                                }`}>
                                    {dike.totalML.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            )}
                        </td>

                        <td className="px-2 py-1 text-center whitespace-nowrap align-middle">
                            {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                    <button 
                                        onClick={saveEdit}
                                        className="p-1 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors border border-green-200"
                                        title="Guardar"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={cancelEdit}
                                        className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors border border-red-200"
                                        title="Cancelar"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEdit(dike)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDuplicateClick(dike)}
                                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => onDeleteDike(dike.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </td>
                        </tr>
                    );
                  })}
                  <tr className="border-t border-dashed border-gray-300 dark:border-gray-700">
                      <td colSpan={showValidation ? 8 : 7} className="p-2 text-center bg-gray-50 dark:bg-gray-900/30">
                          <Button 
                            onClick={() => handleCreateDikeInSector(sector.id)} 
                            variant="outline"
                            className="text-[10px] h-6 px-4 border-dashed bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 mx-auto"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Agregar Dique a {sector.name}
                          </Button>
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      ))}
    </div>
  );
};
