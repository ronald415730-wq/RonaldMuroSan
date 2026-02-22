
import React, { useState, useMemo, useRef, useEffect } from "react";
import { MeasurementEntry, DikeConfig, Sector, BudgetSection } from "../types";
import { Trash2, Upload, AlertCircle, PlusCircle, Database, Settings, Filter, FileText, ChevronDown, FileSpreadsheet, ArrowUp, ArrowDown, X, FileUp, CheckSquare, Download } from "lucide-react";
import { Button } from "./Button";

interface DataEntryGridProps {
  dike: DikeConfig | null;
  entries: MeasurementEntry[];
  customColumns: string[];
  sectors?: Sector[];
  allDikes?: DikeConfig[];
  budget?: BudgetSection[];
  onSelectDike?: (dikeId: string) => void;
  onAddEntry: (entry: MeasurementEntry) => void;
  onUpdateEntries: (entries: MeasurementEntry[]) => void;
  onDeleteEntry: (id: string) => void;
  onAddColumn: (name: string) => void;
  onDeleteColumn: (name: string) => void;
  onFullImport: (data: any) => void;
}

const ColumnImport = ({ onImport, label }: { onImport: (vals: string[]) => void, label?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (evt) => {
         const text = evt.target?.result as string;
         if (text.includes("\0")) {
             alert("El archivo parece ser binario. Use archivos de texto (.csv, .txt).");
             return;
         }
         const lines = text.split(/\r?\n/).map(l => {
             const cleanLine = l.trim();
             if (!cleanLine) return "";
             const parts = cleanLine.split(/[,;\t]/);
             let val = parts[0].trim();
             if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
             return val;
         }).filter(l => l !== "");
         
         if (lines.length > 0) onImport(lines);
         else alert("No se encontraron datos válidos.");
     };
     reader.readAsText(file);
     if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="inline-flex">
        <button 
           onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
           className="text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded p-0.5 transition-all border border-white/10"
           title={`Importar datos para ${label}`}
        >
            <Upload className="w-2.5 h-2.5" />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
    </div>
  )
}

const GridEditableCell = ({ 
    value, 
    onChange, 
    className = "", 
    type = "number",
    validate,
    errorMessage
}: { 
    value: string | number, 
    onChange: (val: string | number) => void, 
    className?: string,
    type?: "text" | "number",
    validate?: (val: string) => boolean,
    errorMessage?: string
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localVal, setLocalVal] = useState(value?.toString() || "");
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => { setLocalVal(value?.toString() || ""); }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const isValid = validate ? validate(localVal) : true;

    const commit = () => {
        setIsEditing(false);
        if (!isValid) {
            setLocalVal(value?.toString() || "");
            return;
        }
        
        if (type === 'number') {
            const cleanVal = localVal.replace(/,/g, '');
            const num = parseFloat(cleanVal);
            if (!isNaN(num)) {
                if (num !== value) onChange(num);
            } else if (localVal === "") {
                if (value !== 0) onChange(0);
            } else {
                setLocalVal(value?.toString() || "");
            }
        } else {
            if (localVal !== value) onChange(localVal);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
            setLocalVal(value?.toString() || "");
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="relative w-full h-full min-h-[20px]">
                <input 
                    ref={inputRef}
                    type="text"
                    className={`w-full h-full px-1 bg-white border border-blue-500 outline-none text-[8px] font-mono shadow-sm ${type === 'number' ? 'text-right' : 'text-left'} absolute inset-0 z-50 ${!isValid ? 'bg-red-50 text-red-700 border-red-500' : ''}`}
                    value={localVal}
                    onChange={e => setLocalVal(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                />
            </div>
        )
    }
    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className={`w-full h-full px-1 py-0.5 cursor-text hover:bg-blue-50/80 transition-colors relative min-h-[20px] flex items-center border border-transparent hover:border-blue-200 ${type === 'number' ? 'justify-end' : 'justify-start'} ${className}`}
        >
            {(value !== undefined && value !== null && value !== "") 
                ? (typeof value === 'number' ? value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 3}) : value) 
                : <span className="text-gray-300">-</span>}
            {!isValid && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 pr-1" title={errorMessage}>
                    <AlertCircle className="w-2 h-2" />
                </div>
            )}
        </div>
    );
}

const GridEditableSelect = ({ 
    value, 
    onChange, 
    options, 
    className = ""
}: { 
    value: string, 
    onChange: (val: string) => void, 
    options: string[],
    className?: string
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditing && selectRef.current) selectRef.current.focus();
    }, [isEditing]);

    const handleBlur = () => setIsEditing(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <select 
                ref={selectRef}
                value={value || ""} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full h-full bg-white border border-blue-500 outline-none text-[8px] font-bold absolute inset-0 z-50 ${className}`}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className={`w-full h-full px-1 py-0.5 cursor-pointer hover:bg-blue-50/80 transition-colors relative flex items-center justify-center min-h-[20px] font-bold ${className}`}
        >
            {value}
        </div>
    );
};

export const DataEntryGrid: React.FC<DataEntryGridProps> = ({ 
    dike, 
    entries, 
    customColumns,
    onAddEntry, 
    onUpdateEntries, 
    onDeleteEntry,
    onAddColumn,
    onDeleteColumn,
}) => {
  const [newPk, setNewPk] = useState("");
  const [newDistancia, setNewDistancia] = useState("");
  const [newTipoEnrocado, setNewTipoEnrocado] = useState("TIPO 2");
  const [newTipoTerreno, setNewTipoTerreno] = useState("B2");
  const [newIntervencion, setNewIntervencion] = useState("PROTECCION DE TALUD CON ENROCADO");
  
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [columnAliases, setColumnAliases] = useState<Record<string, string>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const [pkError, setPkError] = useState<string | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const ALL_COLUMNS = [
    { id: 'pk', label: 'PK' },
    { id: 'distancia', label: 'DIST.' },
    { id: 'tipoTerreno', label: 'TIPO' },
    { id: 'tipoEnrocado', label: 'TIPO ENR.' },
    { id: 'intervencion', label: 'INTERVENCION' },
    { id: 'item403A_Contractual', label: 'CONT.' },
    { id: 'item403A_Rep', label: 'REP.' },
    { id: 'item403A_Fund', label: 'FUND.' },
    { id: 'corteRoca_Recuperacion', label: 'CORTE RECUP.' },
    { id: 'item402B_Contractual', label: 'CONT.' },
    { id: 'item402B_Rep', label: 'REP.' },
    { id: 'item402B_Fund', label: 'FUND.' },
    { id: 'item402E_NivelFreatico', label: 'N.F.' },
    { id: 'item402E_NivelFreatico_MM', label: 'M.M.' },
    { id: 'item405A_Descolmatacion', label: 'NORM.' },
    { id: 'item405A_Descolmatacion_MM', label: 'M.M.' },
    { id: 'item404_Talud_T1', label: 'T1' },
    { id: 'item404_Talud_T2', label: 'T2' },
    { id: 'item404_Talud_T1_MM', label: 'T1 MM' },
    { id: 'item404_Talud_T2_MM', label: 'T2 MM' },
    { id: 'item404_Una_T1', label: 'T1' },
    { id: 'item404_Una_T2', label: 'T2' },
    { id: 'item404_Una_T1_MM', label: 'T1 MM' },
    { id: 'item404_Una_T2_MM', label: 'T2 MM' },
    { id: 'item413A_Contractual', label: 'CONT.' },
    { id: 'item413A_MM', label: 'M.M.' },
    { id: 'item412A_Afirmado', label: '412.A AFIRM.' },
    { id: 'item406A_Perfilado', label: '406.A PERF.' },
    { id: 'item409A_Geotextil', label: '409.A GEOTEX.' },
    { id: 'item416A_Fundacion', label: '416.A FUND.' },
    { id: 'item408A_Zanja', label: '408.A ZANJA' },
    { id: 'gavion', label: 'GAVION' },
    { id: 'item501A_Carguio', label: 'EJEC.' },
    ...customColumns.map(c => ({ id: c, label: c, isCustom: true }))
  ];

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const entryValue = String((entry as any)[key] || '').toLowerCase();
        return entryValue.includes(String(value).toLowerCase());
      });
    });
  }, [entries, filters]);

  const parsePk = (pkStr: string): number => {
    if (!pkStr) return 0;
    const clean = pkStr.toString().replace(/\s/g, '');
    if (clean.includes('+')) {
      const [km, m] = clean.split('+');
      return (parseFloat(km || "0") * 1000) + parseFloat(m || "0");
    }
    return parseFloat(clean) || 0;
  };

  const validatePkFormat = (val: string): boolean => {
    if (!val) return true;
    return /^(\d+\s*\+\s*\d+(\.\d+)?|\d+(\.\d+)?)$/.test(val.trim());
  };

  const isPkUnique = (pk: string, excludeId?: string): boolean => {
    const cleanPk = pk.trim();
    if (!cleanPk) return true;
    return !entries.some(e => e.pk.trim() === cleanPk && e.id !== excludeId);
  };

  const autoCalculatedDistance = useMemo(() => {
    if (!newPk || !validatePkFormat(newPk)) return "0.000";
    let prevMeters = 0;
    if (entries.length > 0) {
        for (let i = entries.length - 1; i >= 0; i--) {
            const entry = entries[i];
            if (entry.pk && validatePkFormat(entry.pk)) {
                prevMeters = parsePk(entry.pk);
                break;
            }
        }
    }
    const currMeters = parsePk(newPk);
    return Math.abs(currMeters - prevMeters).toFixed(3);
  }, [newPk, entries]);

  useEffect(() => {
    if (newPk && validatePkFormat(newPk) && isPkUnique(newPk)) {
      setNewDistancia(autoCalculatedDistance);
    }
  }, [autoCalculatedDistance, newPk]);

  const handlePkChange = (val: string) => {
    setNewPk(val);
    if (val && !validatePkFormat(val)) setPkError("Error Formato");
    else if (val && !isPkUnique(val)) setPkError("PK Duplicado");
    else setPkError(null);
  };

  const handleCellChange = (field: string, value: any, entryId: string) => {
      const updatedEntries = entries.map(e => e.id === entryId ? { ...e, [field]: value } : e);
      onUpdateEntries(updatedEntries);
  };

  const handleExport = (format: 'csv' | 'xls' | 'txt') => {
    const visibleCols = ALL_COLUMNS.filter(c => columnVisibility[c.id] !== false);
    const headers = visibleCols.map(c => columnAliases[c.id] || c.label);
    const fileName = `Metrados_${dike?.name || 'Obra'}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'xls') {
        const rows = filteredEntries.map(e => `<tr>${visibleCols.map(c => `<td>${(e as any)[c.id] || ''}</td>`).join("")}</tr>`).join("");
        const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
        const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `${fileName}.xls`; link.click();
    } else if (format === 'txt') {
        const body = filteredEntries.map(e => visibleCols.map(c => String((e as any)[c.id] || '')).join("\t")).join("\n");
        const content = headers.join("\t") + "\n" + body;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `${fileName}.txt`; link.click();
    } else {
        const body = filteredEntries.map(e => visibleCols.map(c => `"${String((e as any)[c.id] || '').replace(/"/g, '""')}"`).join(",")).join("\n");
        const content = "\uFEFF" + headers.join(",") + "\n" + body;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `${fileName}.csv`; link.click();
    }
    setShowExportMenu(false);
  };

  const handleFullImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !dike) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          const rows = text.split(/\r?\n/).filter(r => r.trim() !== "");
          if (rows.length < 2) {
              alert("El archivo no contiene suficientes datos (encabezado + filas).");
              return;
          }

          const delimiter = text.includes("\t") ? "\t" : (text.includes(";") ? ";" : ",");
          const headers = rows[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toUpperCase());
          
          const newEntries: MeasurementEntry[] = rows.slice(1).map((row, idx) => {
              const cells = row.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
              const entry: any = {
                  id: `IMPORT_${Date.now()}_${idx}`,
                  dikeId: dike.id,
                  pk: "", distancia: 0, tipoTerreno: "B1", tipoEnrocado: "TIPO 2", intervencion: "IMPORTADO",
                  item501A_Carguio: 1
              };

              ALL_COLUMNS.forEach(col => {
                  const headerIdx = headers.findIndex(h => 
                      h === col.id.toUpperCase() || 
                      h === col.label.toUpperCase() || 
                      h === (columnAliases[col.id] || "").toUpperCase()
                  );
                  if (headerIdx !== -1 && cells[headerIdx] !== undefined) {
                      let val: any = cells[headerIdx];
                      if (!['pk', 'intervencion', 'tipoTerreno', 'tipoEnrocado'].includes(col.id)) {
                          val = parseFloat(val.replace(/,/g, '')) || 0;
                      }
                      entry[col.id] = val;
                  }
              });

              return entry as MeasurementEntry;
          });

          if (confirm(`Se han detectado ${newEntries.length} registros. ¿Desea reemplazar los datos actuales del dique ${dike.name}?`)) {
              onUpdateEntries(newEntries);
          }
      };
      reader.readAsText(file);
      if (importFileRef.current) importFileRef.current.value = "";
      setShowImportMenu(false);
  };

  const handleInsertRow = (afterId: string, above: boolean) => {
    const idx = entries.findIndex(e => e.id === afterId);
    const prevEntry = entries[idx];
    const newEntry: MeasurementEntry = {
        ...prevEntry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        pk: "", distancia: 0
    };
    const newEntries = [...entries];
    newEntries.splice(above ? idx : idx + 1, 0, newEntry);
    onUpdateEntries(newEntries);
  };

  const handleAddRowAtEnd = () => {
    if(!newPk || pkError || !dike) return;
    const newEntry: MeasurementEntry = {
        id: Date.now().toString(),
        dikeId: dike.id,
        pk: newPk,
        distancia: parseFloat(newDistancia) || 0,
        tipoTerreno: newTipoTerreno,
        tipoEnrocado: newTipoEnrocado,
        intervencion: newIntervencion,
        item501A_Carguio: 1, 
        item403A_Contractual: 0, item403A_Rep: 0, item403A_Fund: 0,
        corteRoca_Recuperacion: 0,
        item402B_Contractual: 0, item402B_Rep: 0, item402B_Fund: 0,
        item402E_NivelFreatico: 0, item402E_NivelFreatico_MM: 0,
        item405A_Descolmatacion: 0, item405A_Descolmatacion_MM: 0,
        item404_Talud_T1: 0, item404_Talud_T2: 0, item404_Talud_T1_MM: 0, item404_Talud_T2_MM: 0,
        item404_Una_T1: 0, item404_Una_T2: 0, item404_Una_T1_MM: 0, item404_Una_T2_MM: 0,
        item413A_Contractual: 0, item413A_MM: 0,
        item412A_Afirmado: 0, item406A_Perfilado: 0, item409A_Geotextil: 0,
        item416A_Fundacion: 0, item408A_Zanja: 0, gavion: 0,
    };
    onAddEntry(newEntry);
    setNewPk("");
    setNewDistancia("");
  };

  const ColumnHeader = ({ columnId, label, subHeader = false }: { columnId: string, label: string, subHeader?: boolean }) => {
      const alias = columnAliases[columnId];
      const isVisible = columnVisibility[columnId] !== false;
      if (!isVisible) return null;
      return (
          <div className="flex flex-col items-center justify-between h-full group relative w-full px-0.5">
              <span className={`leading-none ${subHeader ? 'text-[7px]' : 'text-[8px]'} font-bold text-center`}>{alias || label}</span>
              {showFilters && (
                  <input 
                    type="text" 
                    value={filters[columnId] || ''} 
                    onChange={e => setFilters(p => ({...p, [columnId]: e.target.value}))} 
                    className="mt-0.5 w-full text-[7px] bg-white text-black border border-blue-200 rounded px-0.5 h-3 outline-none text-center" 
                    placeholder=".." 
                  />
              )}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ColumnImport onImport={(v) => {
                      const ids = filteredEntries.map(e => e.id);
                      const updates = entries.map(e => {
                          const idx = ids.indexOf(e.id);
                          if (idx !== -1 && idx < v.length) {
                              let val: string | number = v[idx];
                              if (val !== "" && !isNaN(Number(val.replace(/,/g,''))) && !['pk','intervencion'].includes(columnId)) val = parseFloat(val.replace(/,/g,''));
                              return { ...e, [columnId]: val };
                          }
                          return e;
                      });
                      onUpdateEntries(updates);
                  }} label={alias || label} />
              </div>
          </div>
      );
  };

  if (!dike) return <div className="p-12 text-center border-2 border-dashed rounded-xl bg-white dark:bg-gray-800"><Database className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 font-medium">Seleccione un Dique para editar su hoja de metrados.</p></div>;

  return (
    <div className="space-y-2 h-full flex flex-col relative">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-lg"><Database className="w-4 h-4 text-blue-700" /></div>
              <div><h3 className="text-xs font-bold text-gray-900 dark:text-white">{dike.name}</h3></div>
          </div>
          <div className="flex items-center gap-1.5">
              <Button onClick={() => setShowColumnManager(true)} className="bg-indigo-600 text-white text-[9px] h-7 px-2 font-bold"><Settings className="w-3.5 h-3.5 mr-1" /> Columnas</Button>
              <Button variant={showFilters ? "primary" : "outline"} onClick={() => setShowFilters(!showFilters)} className="text-[9px] h-7 px-2"><Filter className="w-3.5 h-3.5 mr-1" /> Filtros</Button>
              
              <div className="relative">
                <Button variant="outline" onClick={() => setShowImportMenu(!showImportMenu)} className="bg-blue-50 text-[9px] h-7 px-2 text-blue-700 border-blue-200"><FileUp className="w-3.5 h-3.5 mr-1" /> IMPORTAR <ChevronDown className="w-3 h-3 ml-0.5" /></Button>
                {showImportMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] py-1">
                        <div className="px-3 py-1.5 text-[8px] font-bold text-gray-400 uppercase tracking-widest border-b mb-1">Cargar Dique Completo</div>
                        <button onClick={() => importFileRef.current?.click()} className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center gap-2">Desde CSV / TXT</button>
                        <input type="file" ref={importFileRef} className="hidden" accept=".csv,.txt" onChange={handleFullImport} />
                    </div>
                )}
              </div>

              <div className="relative">
                <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)} className="bg-green-50 text-[9px] h-7 px-2 text-green-700 border-green-200"><FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> EXPORTAR <ChevronDown className="w-3 h-3 ml-0.5" /></Button>
                {showExportMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] py-1">
                        <button onClick={() => handleExport('xls')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 flex items-center gap-2">Excel (.xls)</button>
                        <button onClick={() => handleExport('csv')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center gap-2">CSV (.csv)</button>
                        <button onClick={() => handleExport('txt')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2">Texto Plano (.txt)</button>
                    </div>
                )}
              </div>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1 relative flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar" ref={gridContainerRef}>
            <table className="w-max text-[8px] text-left border-collapse table-fixed">
            <thead className="bg-[#003366] text-white sticky top-0 z-[40]">
                {/* Row 1: Group Headers */}
                <tr className="text-center font-bold border-b border-white/20 h-8">
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[45px]"><ColumnHeader columnId="distancia" label="DIST." /></th>
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[65px] bg-blue-900/50"><ColumnHeader columnId="pk" label="PK" /></th>
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[40px]"><ColumnHeader columnId="tipoTerreno" label="TIPO" /></th>
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[40px]"><ColumnHeader columnId="tipoEnrocado" label="TIPO ENR." /></th>
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[120px]"><ColumnHeader columnId="intervencion" label="INTERVENCION" /></th>
                    
                    <th colSpan={3} className="px-0.5 border-r border-white/20">403.A CONFORMACION</th>
                    <th rowSpan={2} className="px-0.5 border-r border-white/20 w-[45px]"><ColumnHeader columnId="corteRoca_Recuperacion" label="RECUP. ROCA" /></th>
                    <th colSpan={3} className="px-0.5 border-r border-white/20">402.B EXCAVACION MASIVA</th>
                    <th colSpan={2} className="px-0.5 border-r border-white/20">402.E UÑA</th>
                    <th colSpan={2} className="px-0.5 border-r border-white/20 bg-teal-800">405.A DESCOLMAT.</th>
                    <th colSpan={4} className="px-0.5 border-r border-white/20">404.A/B TALUD</th>
                    <th colSpan={4} className="px-0.5 border-r border-white/20">404.D/E UÑA</th>
                    <th colSpan={2} className="px-0.5 border-r border-white/20">413.A RELLENO</th>
                    
                    {/* Varias columns as single headers */}
                    {['item412A_Afirmado','item406A_Perfilado','item409A_Geotextil','item416A_Fundacion','item408A_Zanja','gavion','item501A_Carguio'].map(id => (
                        <th key={id} rowSpan={2} className="px-0.5 border-r border-white/20 w-[40px]"><ColumnHeader columnId={id} label={id} /></th>
                    ))}
                    <th rowSpan={2} className="px-1 bg-slate-800 w-[90px] text-center sticky right-0 z-[50]">ACCIONES</th>
                </tr>
                {/* Row 2: Sub-headers */}
                <tr className="text-center text-[7px] font-bold bg-[#004080] h-6">
                    {/* 403.A */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item403A_Contractual" label="CONT." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item403A_Rep" label="REP." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item403A_Fund" label="FUND." subHeader /></th>
                    
                    {/* 402.B */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item402B_Contractual" label="CONT." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item402B_Rep" label="REP." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item402B_Fund" label="FUND." subHeader /></th>
                    
                    {/* 402.E */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item402E_NivelFreatico" label="N.F." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item402E_NivelFreatico_MM" label="M.M." subHeader /></th>
                    
                    {/* 405.A */}
                    <th className="px-0.5 border-r border-white/10 w-[35px] bg-teal-900/50"><ColumnHeader columnId="item405A_Descolmatacion" label="NORM." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px] bg-teal-900/50"><ColumnHeader columnId="item405A_Descolmatacion_MM" label="M.M." subHeader /></th>
                    
                    {/* 404 TALUD */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Talud_T1" label="T1" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Talud_T2" label="T2" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Talud_T1_MM" label="T1 MM" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Talud_T2_MM" label="T2 MM" subHeader /></th>
                    
                    {/* 404 UÑA */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Una_T1" label="T1" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Una_T2" label="T2" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Una_T1_MM" label="T1 MM" subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item404_Una_T2_MM" label="T2 MM" subHeader /></th>
                    
                    {/* 413.A */}
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item413A_Contractual" label="CONT." subHeader /></th>
                    <th className="px-0.5 border-r border-white/10 w-[35px]"><ColumnHeader columnId="item413A_MM" label="M.M." subHeader /></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white font-mono">
                {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="border-r border-gray-100 text-right"><GridEditableCell type="number" value={entry.distancia} onChange={v => handleCellChange('distancia', v, entry.id)} className="font-bold text-blue-700" /></td>
                        <td className="border-r border-gray-100 text-center bg-blue-50/20"><GridEditableCell type="text" value={entry.pk} onChange={v => handleCellChange('pk', v, entry.id)} validate={v => validatePkFormat(v) && isPkUnique(v, entry.id)} errorMessage="PK inválido o duplicado" /></td>
                        <td className="border-r border-gray-100"><GridEditableSelect value={entry.tipoTerreno} onChange={v => handleCellChange('tipoTerreno', v, entry.id)} options={['B1', 'B2', 'NORMAL']} /></td>
                        <td className="border-r border-gray-100"><GridEditableSelect value={entry.tipoEnrocado} onChange={v => handleCellChange('tipoEnrocado', v, entry.id)} options={['TIPO 1', 'TIPO 2', 'TRANS.']} /></td>
                        <td className="border-r border-gray-100 font-bold"><GridEditableCell type="text" value={entry.intervencion} onChange={v => handleCellChange('intervencion', v, entry.id)} /></td>
                        
                        {/* 403.A */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item403A_Contractual} onChange={v => handleCellChange('item403A_Contractual', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item403A_Rep} onChange={v => handleCellChange('item403A_Rep', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item403A_Fund} onChange={v => handleCellChange('item403A_Fund', v, entry.id)} /></td>
                        
                        {/* Corte Recuperacion */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.corteRoca_Recuperacion} onChange={v => handleCellChange('corteRoca_Recuperacion', v, entry.id)} /></td>
                        
                        {/* 402.B */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item402B_Contractual} onChange={v => handleCellChange('item402B_Contractual', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item402B_Rep} onChange={v => handleCellChange('item402B_Rep', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item402B_Fund} onChange={v => handleCellChange('item402B_Fund', v, entry.id)} /></td>
                        
                        {/* 402.E */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item402E_NivelFreatico} onChange={v => handleCellChange('item402E_NivelFreatico', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item402E_NivelFreatico_MM} onChange={v => handleCellChange('item402E_NivelFreatico_MM', v, entry.id)} /></td>
                        
                        {/* 405.A */}
                        <td className="border-r border-gray-100 bg-teal-50/10"><GridEditableCell value={entry.item405A_Descolmatacion} onChange={v => handleCellChange('item405A_Descolmatacion', v, entry.id)} /></td>
                        <td className="border-r border-gray-100 bg-teal-50/10"><GridEditableCell value={entry.item405A_Descolmatacion_MM} onChange={v => handleCellChange('item405A_Descolmatacion_MM', v, entry.id)} /></td>
                        
                        {/* 404 TALUD */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Talud_T1} onChange={v => handleCellChange('item404_Talud_T1', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Talud_T2} onChange={v => handleCellChange('item404_Talud_T2', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Talud_T1_MM} onChange={v => handleCellChange('item404_Talud_T1_MM', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Talud_T2_MM} onChange={v => handleCellChange('item404_Talud_T2_MM', v, entry.id)} /></td>
                        
                        {/* 404 UÑA */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Una_T1} onChange={v => handleCellChange('item404_Una_T1', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Una_T2} onChange={v => handleCellChange('item404_Una_T2', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Una_T1_MM} onChange={v => handleCellChange('item404_Una_T1_MM', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item404_Una_T2_MM} onChange={v => handleCellChange('item404_Una_T2_MM', v, entry.id)} /></td>
                        
                        {/* 413.A */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item413A_Contractual} onChange={v => handleCellChange('item413A_Contractual', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item413A_MM} onChange={v => handleCellChange('item413A_MM', v, entry.id)} /></td>
                        
                        {/* Varias */}
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item412A_Afirmado} onChange={v => handleCellChange('item412A_Afirmado', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item406A_Perfilado} onChange={v => handleCellChange('item406A_Perfilado', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item409A_Geotextil} onChange={v => handleCellChange('item409A_Geotextil', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item416A_Fundacion} onChange={v => handleCellChange('item416A_Fundacion', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.item408A_Zanja} onChange={v => handleCellChange('item408A_Zanja', v, entry.id)} /></td>
                        <td className="border-r border-gray-100"><GridEditableCell value={entry.gavion} onChange={v => handleCellChange('gavion', v, entry.id)} /></td>
                        
                        {/* Carguio Control */}
                        <td className="border-r border-gray-100 text-center"><div className="flex items-center justify-center h-full"><input type="checkbox" checked={entry.item501A_Carguio === 1} onChange={e => handleCellChange('item501A_Carguio', e.target.checked ? 1 : 0, entry.id)} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /></div></td>
                        
                        <td className="px-1 py-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-[30] border-l border-gray-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleInsertRow(entry.id, true)} className="p-0.5 text-gray-500 hover:bg-gray-100 rounded" title="Ins. Arriba"><ArrowUp className="w-3 h-3" /></button>
                                <button onClick={() => handleInsertRow(entry.id, false)} className="p-0.5 text-gray-500 hover:bg-gray-100 rounded" title="Ins. Abajo"><ArrowDown className="w-3 h-3" /></button>
                                <button onClick={() => onDeleteEntry(entry.id)} className="p-0.5 text-red-600 hover:bg-red-50 rounded" title="Elim."><Trash2 className="w-3 h-3" /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900 sticky bottom-0 z-[40] font-bold text-[8px] border-t border-gray-300">
                <tr className="bg-blue-50/90 h-10">
                    <td className="px-1 py-1 border-r border-blue-200">
                        <input 
                            type="text" 
                            value={newDistancia} 
                            onChange={e => setNewDistancia(e.target.value)} 
                            className="w-full bg-white outline-none text-right font-mono px-1 h-full border border-blue-300 rounded font-bold text-blue-800" 
                            placeholder="0.000"
                        />
                    </td>
                    <td className="px-1 py-1 border-r border-blue-200">
                        <input 
                            type="text" 
                            value={newPk} 
                            onChange={e => handlePkChange(e.target.value)} 
                            placeholder="0+000" 
                            className={`w-full bg-white outline-none px-1 h-full text-[9px] font-mono border-2 rounded ${pkError ? 'text-red-600 border-red-500' : 'border-blue-300'}`} 
                        />
                    </td>
                    <td className="px-1 border-r border-blue-200">
                        <select value={newTipoTerreno} onChange={e => setNewTipoTerreno(e.target.value)} className="w-full bg-white text-[8px] rounded border border-gray-200 outline-none"><option value="B1">B1</option><option value="B2">B2</option><option value="NORMAL">NORMAL</option></select>
                    </td>
                    <td className="px-1 border-r border-blue-200">
                        <select value={newTipoEnrocado} onChange={e => setNewTipoEnrocado(e.target.value)} className="w-full bg-white text-[8px] rounded border border-gray-200 outline-none"><option value="TIPO 1">T1</option><option value="TIPO 2">T2</option></select>
                    </td>
                    <td className="px-1"><input value={newIntervencion} onChange={e => setNewIntervencion(e.target.value)} className="w-full bg-white text-[8px] rounded border border-gray-200 px-1" /></td>
                    <td colSpan={100} className="px-2 py-1"><Button onClick={handleAddRowAtEnd} disabled={!newPk || !!pkError} className="text-[9px] h-6 bg-[#003366] px-4 font-bold text-white shadow-md border-0"><PlusCircle className="w-3.5 h-3.5 mr-1" /> AGREGAR PK FINAL</Button></td>
                </tr>
            </tfoot>
            </table>
        </div>
      </div>

      <div className="bg-[#003366] px-3 py-1 rounded-lg shadow-lg text-white flex justify-between items-center h-8">
          <div className="flex items-center gap-4 text-[9px]">
              <div className="flex items-center gap-1">
                  <span className="font-bold opacity-70">Longitud Total Dique:</span>
                  <span className="font-black text-xs">{(dike.totalML || 0).toFixed(2)} ml</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="flex items-center gap-1">
                  <span className="font-bold opacity-70">Metrado Ejecutado:</span>
                  <span className="font-black text-xs">{filteredEntries.reduce((a, b) => a + Number(b.distancia || 0), 0).toFixed(2)} ml</span>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[8px] opacity-70 italic font-mono uppercase">Control de Áreas y Volúmenes OHLA</span>
          </div>
      </div>
    </div>
  );
};
