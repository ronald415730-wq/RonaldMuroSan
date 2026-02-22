
import React, { useState, useRef, useEffect } from "react";
import { BudgetSection, Sector, BudgetItem, MeasurementEntry, DikeConfig } from "../types";
import { Calculator, Upload, CheckSquare, Square, Layout, Plus, Trash2, Edit2, Copy, AlertTriangle, RefreshCw, Save, Download } from "lucide-react";
import { Button } from "./Button";

interface BudgetPanelProps {
  sectors: Sector[];
  budgetBySector: Record<string, BudgetSection[]>;
  budgetByDike?: Record<string, BudgetSection[]>;
  onUpdateBudget: (sectorId: string, budget: BudgetSection[]) => void;
  onUpdateDikeBudget?: (dikeId: string, budget: BudgetSection[]) => void;
  measurements: MeasurementEntry[];
  dikes: DikeConfig[];
}

const EditableCell = ({ 
    value, 
    onChange, 
    type = "text",
    className = "",
    placeholder = ""
}: { 
    value: string | number, 
    onChange: (val: string) => void, 
    type?: string,
    className?: string,
    placeholder?: string
}) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const commit = () => {
        if (localValue !== value) {
            onChange(localValue.toString());
        }
    };

    const handleBlur = () => {
        commit();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commit();
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setLocalValue(value);
            inputRef.current?.blur();
        }
    };

    return (
        <input 
            ref={inputRef}
            type={type} 
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`bg-transparent outline-none w-full ${className} focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded px-1 transition-colors`}
            placeholder={placeholder}
        />
    );
};

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ 
    sectors, 
    budgetBySector, 
    budgetByDike = {},
    onUpdateBudget, 
    onUpdateDikeBudget,
    measurements, 
    dikes 
}) => {
  const [activeSector, setActiveSector] = useState(sectors[0]?.id || "");
  const [viewMode, setViewMode] = useState<"SECTOR" | "DIKE">("SECTOR");
  const [activeDikeId, setActiveDikeId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter dikes for the active sector
  const sectorDikes = dikes.filter(d => d.sectorId === activeSector);

  // Auto-select first dike when switching sectors or mode
  useEffect(() => {
      if (viewMode === "DIKE" && sectorDikes.length > 0 && !sectorDikes.find(d => d.id === activeDikeId)) {
          setActiveDikeId(sectorDikes[0].id);
      }
  }, [activeSector, viewMode, sectorDikes, activeDikeId]);

  // Determine which budget to display/edit
  const isDikeMode = viewMode === "DIKE" && activeDikeId;
  const activeBudget = isDikeMode 
      ? (budgetByDike[activeDikeId] || []) 
      : (budgetBySector[activeSector] || []);

  const currentDikeName = dikes.find(d => d.id === activeDikeId)?.name || "";

  // Measurements Filter
  const relevantMeasurements = isDikeMode
      ? measurements.filter(m => m.dikeId === activeDikeId)
      : measurements.filter(m => sectorDikes.some(d => d.id === m.dikeId));

  const getExecutedQuantity = (itemCode: string) => {
    return relevantMeasurements.reduce((acc, m) => {
      if (m.item501A_Carguio !== 1) return acc;

      const rawCode = itemCode.trim();
      const baseCode = rawCode.split('_')[0].trim();
      
      const isB2BudgetItem = rawCode.endsWith('_R') || ['404.G', '404.H', '415.A', '416.B', '417.A'].includes(rawCode);
      const isB1BudgetItem = !isB2BudgetItem;

      const isB2Row = m.tipoTerreno === 'B2';
      const isB1Row = m.tipoTerreno === 'B1' || !m.tipoTerreno || m.tipoTerreno === 'NORMAL';

      if (isB2BudgetItem && !isB2Row) return acc;
      if (isB1BudgetItem && !isB1Row) return acc;

      let val = 0;
      const dist = m.distancia || 0;

      if (m[rawCode] !== undefined) {
         val = Number(m[rawCode]);
      } else {
        switch (baseCode) {
            case "402.B": val = (m.item402B_Contractual + m.item402B_Rep + m.item402B_Fund); break;
            case "402.C": val = 0; break;
            case "402.E": val = (m.item402E_NivelFreatico + m.item402E_NivelFreatico_MM); break;
            case "403.A": val = (m.item403A_Contractual + m.item403A_Rep + m.item403A_Fund); break;
            case "404.A": val = (m.item404_Talud_T1 + m.item404_Talud_T1_MM); break;
            case "404.B": val = (m.item404_Talud_T2 + m.item404_Talud_T2_MM); break;
            case "404.G": val = (m.item404_Talud_T1 + m.item404_Talud_T1_MM + m.item404_Talud_T2 + m.item404_Talud_T2_MM); break;
            case "404.D": val = (m.item404_Una_T1 + m.item404_Una_T1_MM); break;
            case "404.F": val = (m.item404_Una_T1 + m.item404_Una_T1_MM); break;
            case "404.E": val = (m.item404_Una_T2 + m.item404_Una_T2_MM); break;
            case "404.H": val = (m.item404_Una_T1 + m.item404_Una_T1_MM + m.item404_Una_T2 + m.item404_Una_T2_MM); break;
            case "405.A": val = (m.item405A_Descolmatacion + m.item405A_Descolmatacion_MM); break;
            case "413.A": val = (m.item413A_Contractual + m.item413A_MM); break;
            case "412.A": val = m.item412A_Afirmado; break;
            case "406.A": val = m.item406A_Perfilado; break;
            case "409.A": val = m.item409A_Geotextil; break;
            case "416.A": val = m.item416A_Fundacion; break;
            case "416.B": val = m.item416A_Fundacion; break;
            case "408.A": val = m.item408A_Zanja; break;
            case "415.A": val = m.gavion; break;
            default: val = 0;
        }
      }
      return acc + (val * dist);
    }, 0);
  };

  const areAllSelected = activeBudget.length > 0 && activeBudget.every(section => 
    section.groups.every(group => 
      group.items.every(item => item.selected !== false)
    )
  );

  let totalDirectCost = 0;
  let totalExecutedCost = 0;
  let totalBalanceCost = 0;
  
  activeBudget.forEach(section => {
    section.groups.forEach(group => {
      group.items.forEach(item => {
        if (item.selected !== false) { 
             const executedQty = getExecutedQuantity(item.code);
             const balanceQty = item.metrado - executedQty;
             
             totalDirectCost += item.metrado * item.price;
             totalExecutedCost += executedQty * item.price;
             totalBalanceCost += (balanceQty > 0 ? balanceQty : 0) * item.price;
        }
      });
    });
  });

  const gastosGenerales = totalDirectCost * 0.1446;
  const utilidad = totalDirectCost * 0.10;
  const subtotal = totalDirectCost + gastosGenerales + utilidad;
  
  const gastosGestion = 9537937.87;
  const buenaVecindad = 449186.01;
  const areasAuxiliares = 211593.17;
  const derechoCantera = 2867059.36;
  
  const costoDeterminado = subtotal + gastosGestion + buenaVecindad + areasAuxiliares + derechoCantera;
  
  const tarifaFee = costoDeterminado * 0.0925;
  const totalSinIgv = costoDeterminado + tarifaFee;
  const igv = totalSinIgv * 0.18;
  const totalConIgv = totalSinIgv + igv;

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleUpdate = (newBudget: BudgetSection[]) => {
      if (isDikeMode) {
          if (onUpdateDikeBudget) onUpdateDikeBudget(activeDikeId, newBudget);
      } else {
          onUpdateBudget(activeSector, newBudget);
      }
  };

  const handleUpdateItem = (sectionId: string, groupId: string, itemId: string, field: keyof BudgetItem, value: any) => {
      const newBudget = JSON.parse(JSON.stringify(activeBudget));
      const section = newBudget.find((s: BudgetSection) => s.id === sectionId);
      if (section) {
          const group = section.groups.find((g: any) => g.id === groupId);
          if (group) {
              const item = group.items.find((i: any) => i.id === itemId);
              if (item) {
                  item[field] = value;
                  handleUpdate(newBudget);
              }
          }
      }
  };

  const handleToggleAll = () => {
    const newState = !areAllSelected;
    const newBudget = JSON.parse(JSON.stringify(activeBudget));
    newBudget.forEach((section: BudgetSection) => {
        section.groups.forEach((group) => {
            group.items.forEach((item) => {
                item.selected = newState;
            });
        });
    });
    handleUpdate(newBudget);
  };

  const handleAddItem = (sectionId: string, groupId: string) => {
      const newBudget = JSON.parse(JSON.stringify(activeBudget));
      const section = newBudget.find((s: BudgetSection) => s.id === sectionId);
      if (section) {
          const group = section.groups.find((g: any) => g.id === groupId);
          if (group) {
              const newItem: BudgetItem = {
                  id: Date.now().toString(),
                  code: "NEW.01",
                  description: "Nueva Partida",
                  unit: "und",
                  metrado: 0,
                  price: 0,
                  selected: true
              };
              group.items.push(newItem);
              handleUpdate(newBudget);
          }
      }
  };

  const handleDeleteItem = (sectionId: string, groupId: string, itemId: string) => {
      if(!confirm("¿Eliminar esta partida?")) return;
      
      const newBudget = JSON.parse(JSON.stringify(activeBudget));
      const section = newBudget.find((s: BudgetSection) => s.id === sectionId);
      if (section) {
          const group = section.groups.find((g: any) => g.id === groupId);
          if (group) {
              group.items = group.items.filter((i: any) => i.id !== itemId);
              handleUpdate(newBudget);
          }
      }
  };

  const handleInitializeDikeBudget = (copyQuantities: boolean) => {
      const sectorBudget = budgetBySector[activeSector] || [];
      const newBudget = JSON.parse(JSON.stringify(sectorBudget));
      
      if (!copyQuantities) {
          newBudget.forEach((sec: BudgetSection) => {
              sec.groups.forEach(grp => {
                  grp.items.forEach(item => {
                      item.metrado = 0;
                  });
              });
          });
      }
      
      if (onUpdateDikeBudget) {
          onUpdateDikeBudget(activeDikeId, newBudget);
      }
  };

  const handleImportBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const json = JSON.parse(evt.target?.result as string);
              if (Array.isArray(json)) {
                  handleUpdate(json);
                  alert("Presupuesto importado correctamente.");
              } else {
                  alert("Formato de archivo inválido.");
              }
          } catch (err) {
              alert("Error al leer el archivo JSON.");
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportCSV = () => {
    const sectorName = sectors.find(s => s.id === activeSector)?.name || "Sector";
    const fileName = isDikeMode 
        ? `Presupuesto_${currentDikeName}_${new Date().toISOString().slice(0, 10)}.csv`
        : `Presupuesto_${sectorName}_${new Date().toISOString().slice(0, 10)}.csv`;

    const headers = ["Item", "Descripcion", "Unidad", "Metrado", "Precio Unitario", "Total"];
    const rows: string[][] = [];

    activeBudget.forEach(section => {
        // Section Header Row
        rows.push([section.id, section.name, "", "", "", ""]);
        
        section.groups.forEach(group => {
            // Group Header Row
            rows.push([group.code, group.name, "", "", "", ""]);
            
            group.items.forEach(item => {
                if (item.selected !== false) {
                    const total = item.metrado * item.price;
                    rows.push([
                        item.code,
                        item.description,
                        item.unit,
                        item.metrado.toString(),
                        item.price.toString(),
                        total.toFixed(2)
                    ]);
                }
            });
        });
    });

    // Formatting for CSV
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const bom = "\uFEFF"; // Byte Order Mark for Excel UTF-8 compatibility
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Sector Navigation */}
      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 mb-2 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
         {sectors.map(sector => (
             <button
                key={sector.id}
                onClick={() => setActiveSector(sector.id)}
                className={`px-4 py-2 text-[10px] font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeSector === sector.id
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
             >
                <Layout className="w-3 h-3" />
                {sector.name}
             </button>
         ))}
      </div>

      {/* View Mode Switcher */}
      <div className="flex justify-center mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
              <button
                  onClick={() => setViewMode("SECTOR")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === "SECTOR" 
                      ? "bg-white shadow text-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                  Presupuesto de Sector
              </button>
              <button
                  onClick={() => setViewMode("DIKE")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === "DIKE" 
                      ? "bg-white shadow text-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                  Presupuesto por Dique
              </button>
          </div>
      </div>

      {/* Dike Selector (Only visible in Dike Mode) */}
      {viewMode === "DIKE" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
              <label className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block mb-2">Seleccionar Dique:</label>
              <div className="flex flex-wrap gap-2">
                  {sectorDikes.map(dike => (
                      <button
                          key={dike.id}
                          onClick={() => setActiveDikeId(dike.id)}
                          className={`px-3 py-1.5 text-[10px] rounded-md border transition-all ${
                              activeDikeId === dike.id
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                      >
                          {dike.name}
                      </button>
                  ))}
                  {sectorDikes.length === 0 && (
                      <span className="text-xs text-gray-500 italic">No hay diques en este sector.</span>
                  )}
              </div>
          </div>
      )}

      {/* Empty State for Dike Budget */}
      {isDikeMode && activeBudget.length === 0 && activeDikeId && (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  No hay presupuesto configurado para el dique <span className="font-bold">{currentDikeName}</span>.
              </p>
              <div className="flex justify-center gap-4">
                  <Button onClick={() => handleInitializeDikeBudget(false)} variant="primary" className="text-xs">
                      <Layout className="w-3 h-3 mr-2" /> Iniciar (Cantidades en 0)
                  </Button>
                  <Button onClick={() => handleInitializeDikeBudget(true)} variant="outline" className="text-xs">
                      <Copy className="w-3 h-3 mr-2" /> Copiar Todo del Sector
                  </Button>
              </div>
          </div>
      )}

      {/* Main Budget Table Panel */}
      {(activeBudget.length > 0 || !isDikeMode) && (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                    <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isDikeMode ? `Presupuesto Específico: ${currentDikeName}` : "Presupuesto Específico de Sector"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        {isDikeMode && (
                            <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200 flex items-center">
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Ajustes por Dique
                            </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isDikeMode ? "Modificaciones manuales habilitadas para esta estructura" : `Sector: ${sectors.find(s=>s.id === activeSector)?.name}`}
                        </p>
                    </div>
                </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Presupuesto (Inc. IGV)</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalConIgv)}</p>
                    </div>
                    <div className="flex gap-2">
                        {isDikeMode && (
                            <Button 
                                variant="outline" 
                                className="text-[10px] h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                    if(confirm("¿Restablecer al presupuesto del sector? Se perderán los cambios específicos.")) {
                                        handleInitializeDikeBudget(true);
                                    }
                                }}
                            >
                                <RefreshCw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImportBudget} 
                            className="hidden" 
                            accept=".json" 
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="text-[10px] h-7 px-2">
                            <Upload className="w-3 h-3" /> Importar
                        </Button>
                        <Button variant="outline" onClick={handleExportCSV} className="text-[10px] h-7 px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            <Download className="w-3 h-3 mr-1" /> Exportar CSV
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                    <tr className="bg-[#003366] text-white uppercase text-[10px] font-bold">
                        <th className="px-1 py-1 text-center w-6">
                            <button onClick={handleToggleAll} className="flex items-center justify-center hover:text-blue-300 transition-colors" title={areAllSelected ? "Deseleccionar Todo" : "Seleccionar Todo"}>
                                {areAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            </button>
                        </th>
                        <th className="px-1 py-1 text-left w-12">Item</th>
                        <th className="px-1 py-1 text-left">Descripción</th>
                        <th className="px-1 py-1 text-center w-8">Und.</th>
                        <th className="px-1 py-1 text-right w-16">Metrado</th>
                        <th className="px-1 py-1 text-right w-16">P. Unit.</th>
                        <th className="px-1 py-1 text-right w-20 bg-blue-900 border-l border-blue-800">Parcial S/.</th>
                        <th className="px-1 py-1 text-right w-20 bg-green-900 border-l border-green-800">Ejecutado S/.</th>
                        <th className="px-1 py-1 text-right w-20 bg-gray-700 border-l border-gray-600">Saldo S/.</th>
                        <th className="px-1 py-1 text-center w-8"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activeBudget.map((section) => (
                        <React.Fragment key={section.id}>
                        <tr className="bg-green-600 text-white font-bold text-[10px]">
                            <td className="px-1 py-1"></td>
                            <td className="px-1 py-1">{section.id}</td>
                            <td colSpan={4} className="px-1 py-1">{section.name}</td>
                            <td className="px-1 py-1 text-right">
                                {formatCurrency(section.groups.reduce((accS, g) => accS + g.items.reduce((accI, i) => accI + (i.selected !== false ? (i.metrado * i.price) : 0), 0), 0))}
                            </td>
                            <td colSpan={3}></td>
                        </tr>
                        
                        {section.groups.map((group) => (
                            <React.Fragment key={group.id}>
                            <tr className="bg-yellow-100 dark:bg-yellow-900/30 font-semibold text-gray-800 dark:text-gray-200 text-[10px]">
                                <td className="px-1 py-1"></td>
                                <td className="px-1 py-1">{group.code}</td>
                                <td colSpan={4} className="px-1 py-1">{group.name}</td>
                                <td className="px-1 py-1 text-right text-gray-700 dark:text-gray-300">
                                    {formatCurrency(group.items.reduce((acc, i) => acc + (i.selected !== false ? (i.metrado * i.price) : 0), 0))}
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                            
                            {group.items.map((item) => {
                                const executedQty = getExecutedQuantity(item.code);
                                const balanceQty = item.metrado - executedQty;
                                const executedAmount = executedQty * item.price;
                                const balanceAmount = (balanceQty > 0 ? balanceQty : 0) * item.price;

                                return (
                                <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-xs ${item.selected === false ? 'opacity-50 grayscale' : ''}`}>
                                <td className="px-1 py-1 text-center">
                                    <button 
                                        onClick={() => handleUpdateItem(section.id, group.id, item.id, 'selected', item.selected === undefined ? false : !item.selected)}
                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                        title={item.selected !== false ? "Excluir del cálculo" : "Incluir en cálculo"}
                                    >
                                        {item.selected !== false ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                                    </button>
                                </td>
                                <td className="px-1 py-1 font-medium text-gray-500">
                                    <EditableCell 
                                        value={item.code} 
                                        onChange={(val) => handleUpdateItem(section.id, group.id, item.id, 'code', val)}
                                        className="font-medium"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <EditableCell 
                                        value={item.description} 
                                        onChange={(val) => handleUpdateItem(section.id, group.id, item.id, 'description', val)}
                                    />
                                </td>
                                <td className="px-1 py-1 text-center text-gray-500">
                                    <EditableCell 
                                        value={item.unit} 
                                        onChange={(val) => handleUpdateItem(section.id, group.id, item.id, 'unit', val)}
                                        className="text-center"
                                    />
                                </td>
                                <td className={`px-1 py-1 text-right font-mono ${isDikeMode ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                                    <EditableCell 
                                        value={item.metrado} 
                                        onChange={(val) => handleUpdateItem(section.id, group.id, item.id, 'metrado', parseFloat(val) || 0)}
                                        type="number"
                                        className={`text-right font-bold ${isDikeMode ? 'text-orange-800 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300'}`}
                                    />
                                </td>
                                <td className={`px-1 py-1 text-right font-mono ${isDikeMode ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                                    <EditableCell 
                                        value={item.price} 
                                        onChange={(val) => handleUpdateItem(section.id, group.id, item.id, 'price', parseFloat(val) || 0)}
                                        type="number"
                                        className={`text-right font-bold ${isDikeMode ? 'text-orange-800 dark:text-orange-300' : ''}`}
                                    />
                                </td>
                                <td className="px-1 py-1 text-right font-mono font-medium text-gray-700 dark:text-gray-300 border-l border-blue-100 dark:border-blue-900/30">
                                    <div>{(item.metrado * item.price).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                    <div className="text-[9px] text-gray-400 font-normal">
                                        (P.U. {item.price.toFixed(2)})
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-right font-mono text-green-700 dark:text-green-400 bg-green-50/20 dark:bg-green-900/10 border-l border-green-100 dark:border-green-900/30">
                                    {executedAmount.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </td>
                                <td className="px-1 py-1 text-right font-mono text-gray-600 dark:text-gray-400 bg-gray-50/20 dark:bg-gray-800/20 border-l border-gray-100 dark:border-gray-700">
                                    {balanceAmount.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </td>
                                <td className="px-1 py-1 text-center">
                                    <button 
                                        onClick={() => handleDeleteItem(section.id, group.id, item.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Eliminar partida"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                                </tr>
                            )})}
                            <tr>
                                <td colSpan={10} className="px-1 py-1 bg-gray-50 dark:bg-gray-900/30">
                                    <button 
                                        onClick={() => handleAddItem(section.id, group.id)}
                                        className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-800 font-medium uppercase tracking-wide ml-8"
                                    >
                                        <Plus className="w-3 h-3" /> Agregar Partida a {group.code}
                                    </button>
                                </td>
                            </tr>
                            </React.Fragment>
                        ))}
                        </React.Fragment>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600 font-bold text-gray-800 dark:text-gray-200 text-[10px]">
                        <tr>
                            <td colSpan={6} className="px-3 py-1.5 text-right">TOTAL COSTO DIRECTO</td>
                            <td className="px-3 py-1.5 text-right border-l border-gray-200">{formatCurrency(totalDirectCost)}</td>
                            <td className="px-3 py-1.5 text-right text-green-700 border-l border-gray-200">{formatCurrency(totalExecutedCost)}</td>
                            <td className="px-3 py-1.5 text-right text-gray-600 border-l border-gray-200">{formatCurrency(totalBalanceCost)}</td>
                            <td></td>
                        </tr>
                        <tr className="text-gray-600 dark:text-gray-400">
                            <td colSpan={6} className="px-3 py-1 text-right">GASTOS GENERALES (14.46%)</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(gastosGenerales)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-gray-600 dark:text-gray-400">
                            <td colSpan={6} className="px-3 py-1 text-right">UTILIDAD (10.00%)</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(utilidad)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <td colSpan={6} className="px-3 py-1.5 text-right">SUBTOTAL</td>
                            <td className="px-3 py-1.5 text-right border-l border-gray-200">{formatCurrency(subtotal)}</td>
                            <td colSpan={3}></td>
                        </tr>
                         <tr className="text-[9px] text-gray-500">
                            <td colSpan={6} className="px-3 py-1 text-right">GASTOS DE GESTION DEL CONTRATISTA</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(gastosGestion)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-[9px] text-gray-500">
                            <td colSpan={6} className="px-3 py-1 text-right">BUENA VECINDAD Y RRPP</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(buenaVecindad)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-[9px] text-gray-500">
                            <td colSpan={6} className="px-3 py-1 text-right">AREAS AUXILIARES</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(areasAuxiliares)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-[9px] text-gray-500">
                            <td colSpan={6} className="px-3 py-1 text-right">DERECHO DE CANTERA</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(derechoCantera)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <td colSpan={6} className="px-3 py-1.5 text-right">COSTO DETERMINADO</td>
                            <td className="px-3 py-1.5 text-right border-l border-gray-200">{formatCurrency(costoDeterminado)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr>
                            <td colSpan={6} className="px-3 py-1 text-right">TARIFA O FEE (9.25%)</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(tarifaFee)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-blue-700 dark:text-blue-300">
                            <td colSpan={6} className="px-3 py-1.5 text-right">TOTAL PRESUPUESTO (SIN IGV)</td>
                            <td className="px-3 py-1.5 text-right border-l border-gray-200">{formatCurrency(totalSinIgv)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="text-gray-600 dark:text-gray-400">
                            <td colSpan={6} className="px-3 py-1 text-right">IGV (18%)</td>
                            <td className="px-3 py-1 text-right border-l border-gray-200">{formatCurrency(igv)}</td>
                            <td colSpan={3}></td>
                        </tr>
                        <tr className="bg-[#003366] text-white text-sm">
                            <td colSpan={6} className="px-3 py-2 text-right">TOTAL (INC. IGV)</td>
                            <td className="px-3 py-2 text-right border-l border-blue-800">{formatCurrency(totalConIgv)}</td>
                            <td colSpan={3}></td>
                        </tr>
                    </tfoot>
                </table>
                </div>
            </div>
        </>
      )}
    </div>
  );
};
