

import { Sector, DikeConfig, MeasurementEntry, AspectRatio, ImageSize, BannerStyle, BudgetSection, ProgressEntry } from "./types";

export const SECTORS: Sector[] = [
  { id: "CASMA", name: "SECTOR CASMA" },
  { id: "CONFLUENCIA", name: "SECTOR CONFLUENCIA" },
  { id: "RIO_GRANDE", name: "SECTOR RIO GRANDE" },
  { id: "SECHIN", name: "SECTOR SECHIN" },
];

export const INITIAL_DIKES: DikeConfig[] = [
  // SECTOR CASMA
  { id: "DIPR_001_MI", sectorId: "CASMA", name: "DIPR_001_MI", progInicioRio: "0+140.000", progFinRio: "5+500.000", progInicioDique: "0+560.000", progFinDique: "2+700.000", totalML: 2140.00 },
  { id: "DIPR_002_MD", sectorId: "CASMA", name: "DIPR_002_MD", progInicioRio: "0+490.000", progFinRio: "5+500.000", progInicioDique: "-0+004.190", progFinDique: "5+064.290", totalML: 5068.48 },

  // SECTOR CONFLUENCIA
  { id: "DIPR_001b_MI", sectorId: "CONFLUENCIA", name: "DIPR_001b_MI", progInicioRio: "5+500.000", progFinRio: "9+050.000", progInicioDique: "5+397.000", progFinDique: "8+922.000", totalML: 3525.00 },
  { id: "DIPR_002b_MD", sectorId: "CONFLUENCIA", name: "DIPR_002b_MD", progInicioRio: "1+025.000", progFinRio: "5+500.000", progInicioDique: "5+064.000", progFinDique: "11+175.000", totalML: 6111.00 },
  { id: "DIPR_003_MI", sectorId: "CONFLUENCIA", name: "DIPR_003_MI", progInicioRio: "9+857.000", progFinRio: "10+438.000", progInicioDique: "0+011.000", progFinDique: "0+579.000", totalML: 568.00 },
  { id: "DIPR_004_MI", sectorId: "CONFLUENCIA", name: "DIPR_004_MI", progInicioRio: "0+971.000", progFinRio: "3+969.000", progInicioDique: "0+060.000", progFinDique: "0+920.000", totalML: 860.00 },
  { id: "DIPR_005_MI", sectorId: "CONFLUENCIA", name: "DIPR_005_MI", progInicioRio: "2+218.000", progFinRio: "10+998.000", progInicioDique: "0+000.000", progFinDique: "8+900.000", totalML: 8900.00 },
  { id: "DIPR_006_MD", sectorId: "CONFLUENCIA", name: "DIPR_006_MD", progInicioRio: "5+823.000", progFinRio: "10+999.000", progInicioDique: "0+000.000", progFinDique: "5+946.030", totalML: 5946.03 },
  { id: "DIPR_015_MD", sectorId: "CONFLUENCIA", name: "DIPR_015_MD", progInicioRio: "1+954.000", progFinRio: "6+000.000", progInicioDique: "0+000.000", progFinDique: "4+047.886", totalML: 4047.89 },
  { id: "DIPR_016_MI", sectorId: "CONFLUENCIA", name: "DIPR_016_MI", progInicioRio: "1+950.000", progFinRio: "6+000.000", progInicioDique: "0+000.000", progFinDique: "4+055.678", totalML: 4055.68 },
  { id: "MIPR-001-MD", sectorId: "CONFLUENCIA", name: "MIPR-001-MD", progInicioRio: "1+950.000", progFinRio: "6+000.000", progInicioDique: "0+000.000", progFinDique: "0+838.000", totalML: 4050.00 },
  { id: "DESCOL_1_C", sectorId: "CONFLUENCIA", name: "Descolmatación 1", progInicioRio: "5+500.000", progFinRio: "10+643.000", progInicioDique: "", progFinDique: "", totalML: 5143.00 },
  { id: "DESCOL_2_C", sectorId: "CONFLUENCIA", name: "Descolmatación 2", progInicioRio: "0+000.000", progFinRio: "6+000.000", progInicioDique: "", progFinDique: "", totalML: 6000.00 },
  { id: "DESCOL_3_C", sectorId: "CONFLUENCIA", name: "Descolmatación 3", progInicioRio: "0+000.000", progFinRio: "11+000.000", progInicioDique: "", progFinDique: "", totalML: 11000.00 },

  // SECTOR RIO GRANDE (Updated from Images)
  { id: "DIPR_05_MI_RG", sectorId: "RIO_GRANDE", name: "DIPR-005-MI", progInicioRio: "11+000.000", progFinRio: "25+940.000", progInicioDique: "8+900.000", progFinDique: "24+116.000", totalML: 15216.00 },
  { id: "DIPR_06_MD_RG", sectorId: "RIO_GRANDE", name: "DIPR-006-MD", progInicioRio: "11+000.000", progFinRio: "13+910.000", progInicioDique: "5+946.000", progFinDique: "8+845.000", totalML: 2899.00 },
  { id: "DIPR_08_MD_RG", sectorId: "RIO_GRANDE", name: "DIPR-008-MD", progInicioRio: "18+228.000", progFinRio: "18+722.000", progInicioDique: "0+000.000", progFinDique: "0+470.000", totalML: 470.00 },
  { id: "DIPR_09_MD_RG", sectorId: "RIO_GRANDE", name: "DIPR-009-MD", progInicioRio: "19+974.000", progFinRio: "32+890.000", progInicioDique: "0+000.000", progFinDique: "12+862.000", totalML: 12862.00 },
  { id: "DIPR_10_MI_RG", sectorId: "RIO_GRANDE", name: "DIPR-010-MI", progInicioRio: "27+610.000", progFinRio: "28+300.000", progInicioDique: "0+000.000", progFinDique: "0+662.000", totalML: 662.00 },
  { id: "DIPR_11_MI_RG", sectorId: "RIO_GRANDE", name: "DIPR-011-MI", progInicioRio: "28+445.000", progFinRio: "29+210.000", progInicioDique: "0+000.000", progFinDique: "0+747.000", totalML: 747.00 },
  { id: "DIPR_12_MD_RG", sectorId: "RIO_GRANDE", name: "DIPR-012-MD", progInicioRio: "32+960.000", progFinRio: "34+190.000", progInicioDique: "0+000.000", progFinDique: "1+214.000", totalML: 1214.00 },
  { id: "DIPR_13_MD_RG", sectorId: "RIO_GRANDE", name: "DIPR-013-MD", progInicioRio: "35+220.000", progFinRio: "36+890.000", progInicioDique: "0+000.000", progFinDique: "1+739.000", totalML: 1739.00 },
  { id: "DIPR_14_MI_RG", sectorId: "RIO_GRANDE", name: "DIPR-014-MI", progInicioRio: "35+630.000", progFinRio: "36+910.000", progInicioDique: "0+000.000", progFinDique: "1+275.050", totalML: 1275.05 },

  // SECTOR SECHIN
  { id: "DIPR_015_MD_S", sectorId: "SECHIN", name: "DIPR_015_MD", progInicioRio: "6+000.000", progFinRio: "8+060.000", progInicioDique: "4+047.886", progFinDique: "6+130.000", totalML: 2082.11 },
  { id: "DIPR_016_MI_S", sectorId: "SECHIN", name: "DIPR_016_MI", progInicioRio: "6+000.000", progFinRio: "19+500.000", progInicioDique: "4+055.678", progFinDique: "14+754.000", totalML: 10698.32 },
  { id: "DIPR_017_MD_S", sectorId: "SECHIN", name: "DIPR_017_MD", progInicioRio: "9+100.000", progFinRio: "13+520.000", progInicioDique: "0+000.000", progFinDique: "4+452.000", totalML: 4452.00 },
  { id: "DIPR_018_MD_S", sectorId: "SECHIN", name: "DIPR_018_MD", progInicioRio: "15+280.000", progFinRio: "19+500.000", progInicioDique: "0+000.000", progFinDique: "3+130.000", totalML: 3130.00 },
  { id: "DIPR_019_MD_S", sectorId: "SECHIN", name: "DIPR_019_MD", progInicioRio: "21+033.000", progFinRio: "21+289.000", progInicioDique: "0+000.000", progFinDique: "0+290.000", totalML: 290.00 },
  { id: "DIPR_020_MD_S", sectorId: "SECHIN", name: "DIPR_020_MD", progInicioRio: "22+756.000", progFinRio: "23+600.000", progInicioDique: "0+000.000", progFinDique: "0+855.000", totalML: 855.00 },
  { id: "DIPR_021_MI_S", sectorId: "SECHIN", name: "DIPR_021_MI", progInicioRio: "21+550.000", progFinRio: "23+539.000", progInicioDique: "0+000.000", progFinDique: "1+840.000", totalML: 1840.00 },
  { id: "DESCOL_1_S", sectorId: "SECHIN", name: "Descolmatación 1", progInicioRio: "6+000.000", progFinRio: "19+500.000", progInicioDique: "", progFinDique: "", totalML: 13500.00 },
  { id: "DESCOL_2_S", sectorId: "SECHIN", name: "Descolmatación 2", progInicioRio: "21+033.000", progFinRio: "23+600.000", progInicioDique: "", progFinDique: "", totalML: 2567.00 },
];

export const INITIAL_MEASUREMENTS: MeasurementEntry[] = [
  { 
    id: "1", 
    dikeId: "DIPR_05_MI_RG", 
    pk: "8+900.00", 
    distancia: 0.00, 
    tipoTerreno: "B2", 
    tipoEnrocado: "TIPO 2", 
    intervencion: "PROTECCION DE TALUD CON ENROCADO",
    
    item403A_Contractual: 0.50, item403A_Rep: 0.00, item403A_Fund: 0.00,
    corteRoca_Recuperacion: 5.150,
    item402B_Contractual: 0.090, item402B_Rep: 0.00, item402B_Fund: 0.00,
    item402E_NivelFreatico: 8.840,
    item402E_NivelFreatico_MM: 0.00,

    item405A_Descolmatacion: 0.00,
    item405A_Descolmatacion_MM: 0.00,
    
    item404_Talud_T1: 7.750, item404_Talud_T2: 0.00, item404_Talud_T1_MM: 0.00, item404_Talud_T2_MM: 0.00,
    item404_Una_T1: 8.840, item404_Una_T2: 0.00, item404_Una_T1_MM: 0.00, item404_Una_T2_MM: 0.00,
    
    item413A_Contractual: 2.480, item413A_MM: 0.00,
    item412A_Afirmado: 0.620,
    item406A_Perfilado: 0.070,
    item409A_Geotextil: 11.240,
    item416A_Fundacion: 0.00,
    item408A_Zanja: 0.00,
    gavion: 0.00
  },
   { 
    id: "2", 
    dikeId: "DIPR_05_MI_RG", 
    pk: "8+920.01", 
    distancia: 20.010, 
    tipoTerreno: "B2", 
    tipoEnrocado: "TIPO 2", 
    intervencion: "PROTECCION DE TALUD CON ENROCADO",
    
    item403A_Contractual: 0.820, item403A_Rep: 0.460, item403A_Fund: 0.00,
    corteRoca_Recuperacion: 4.460,
    item402B_Contractual: 0.420, item402B_Rep: 0.00, item402B_Fund: 0.00,
    item402E_NivelFreatico: 8.830,
    item402E_NivelFreatico_MM: 0.00,

    item405A_Descolmatacion: 0.00,
    item405A_Descolmatacion_MM: 0.00,
    
    item404_Talud_T1: 7.750, item404_Talud_T2: 0.00, item404_Talud_T1_MM: 0.00, item404_Talud_T2_MM: 0.00,
    item404_Una_T1: 8.830, item404_Una_T2: 0.00, item404_Una_T1_MM: 0.00, item404_Una_T2_MM: 0.00,
    
    item413A_Contractual: 2.480, item413A_MM: 0.00,
    item412A_Afirmado: 0.620,
    item406A_Perfilado: 2.190,
    item409A_Geotextil: 11.230,
    item416A_Fundacion: 0.00,
    item408A_Zanja: 0.00,
    gavion: 0.00
  },
];

export const INITIAL_BUDGET: BudgetSection[] = [
  {
    id: "A",
    name: "A - TRABAJOS DE OPERACIÓN Y EXPLOTACIÓN EN CANTERA",
    groups: [
      {
        id: "100", code: "100", name: "OBRAS PROVISIONALES",
        items: [
          { id: "101.A", code: "101.A", description: "TRÁMITE, GESTIÓN Y OBTENCIÓN DE PERMISOS PARA USO Y ADQUISICIÓN DE EXPLOSIVOS", unit: "glb", metrado: 1.00, price: 4141.55 },
          { id: "101.B", code: "101.B", description: "TRÁMITE, GESTIÓN Y OBTENCIÓN DE PERMISOS PARA MANIPULACIÓN DE EXPLOSIVOS", unit: "glb", metrado: 1.00, price: 4141.55 },
          { id: "101.C", code: "101.C", description: "TRÁMITE, GESTIÓN Y OBTENCIÓN DE PERMISOS PARA ALMACENAMIENTO Y USO DE POLVORÍN", unit: "glb", metrado: 1.00, price: 5508.26 },
          { id: "103.A", code: "103.A", description: "INSTALACIÓN DE CAMPAMENTO, PATIO, TALLER Y OFICINAS", unit: "glb", metrado: 1.00, price: 293205.31 },
        ]
      },
      {
        id: "200", code: "200", name: "OBRAS PRELIMINARES",
        items: [
          { id: "201.A", code: "201.A", description: "MOVILIZACIÓN Y DESMOVILIZACIÓN DE MAQUINARIA", unit: "glb", metrado: 1.00, price: 438432.84 },
          { id: "203.A", code: "203.A", description: "CONTROL TOPOGRAFICO DE LOS TRABAJOS", unit: "mes", metrado: 8.00, price: 20122.88 },
          { id: "204.A", code: "204.A", description: "HABILITACIÓN DE CAMINOS DE ACCESOS A CANTERA", unit: "km", metrado: 4.97, price: 74354.61 },
        ]
      },
      {
        id: "300", code: "300", name: "OPERACIÓN Y EXPLOTACION DE MATERIAL",
        items: [
          { id: "301.A", code: "301.A", description: "EXTRACCIÓN DE ROCA EN CANTERA (CON EXPLOSIVOS)", unit: "m3", metrado: 387726.24, price: 39.22 },
          { id: "303.A", code: "303.A", description: "SELECCIÓN Y ACOPIO DE ROCA (ACUERDO AL DISEÑO Y POR TIPO)", unit: "m3", metrado: 387726.24, price: 30.12 },
        ]
      }
    ]
  },
  {
    id: "B",
    name: "B - CONSTRUCCIÓN DE DEFENSAS RIBEREÑAS",
    groups: [
      {
        id: "B1", code: "B1", name: "CONSTRUCCIÓN DE DIQUE NUEVO",
        items: [
          { id: "401.A", code: "401.A", description: "DESBROCE Y LIMPIEZA", unit: "ha", metrado: 0.12, price: 6687.17 },
          { id: "402.B", code: "402.B", description: "EXCAVACIÓN MASIVA EN MATERIAL SUELTO, CON EQUIPO", unit: "m3", metrado: 221213.79, price: 7.62 },
          { id: "402.C", code: "402.C", description: "EXCAVACIÓN EN ROCA SUELTA CON EQUIPO", unit: "m3", metrado: 2257.28, price: 18.38 },
          { id: "402.D", code: "402.D", description: "EXCAVACION DE ROCA FIJA CON MARTILLO HIDRÁULICO", unit: "m3", metrado: 2257.28, price: 116.66 },
          { id: "402.E", code: "402.E", description: "EXCAVACION DE UÑA EN MATERIAL CON NIVEL FREÁTICO", unit: "m3", metrado: 125470.90, price: 12.12 },
          { id: "403.A", code: "403.A", description: "CONFORMACIÓN Y COMPACTACIÓN DE DIQUE", unit: "m3", metrado: 275530.39, price: 14.26 },
          { id: "404.A", code: "404.A", description: "ENROCADO Y ACOMODO PARA PROTECCIÓN DE TALUD TIPO 1", unit: "m3", metrado: 61919.47, price: 43.02 },
          { id: "404.B", code: "404.B", description: "ENROCADO Y ACOMODO PARA PROTECCIÓN DE TALUD TIPO 2", unit: "m3", metrado: 92388.66, price: 43.02 },
          { id: "404.D", code: "404.D", description: "ENROCADO Y ACOMODO EN UÑA ANTISOCAVANTE TIPO 1", unit: "m3", metrado: 41965.43, price: 19.36 },
          { id: "404.E", code: "404.E", description: "ENROCADO Y ACOMODO EN UÑA ANTISOCAVANTE TIPO 2", unit: "m3", metrado: 86134.53, price: 19.36 },
          { id: "405.A", code: "405.A", description: "DESCOLMATACIÓN DEL CAUCE", unit: "m3", metrado: 208346.46, price: 12.16 },
          { id: "406.A", code: "406.A", description: "REFINE Y PERFILADO DE TALUD", unit: "m2", metrado: 118012.29, price: 2.80 },
          { id: "407.A", code: "407.A", description: "MEJORAMIENTO DE SUELO DE FUNDACIÓN", unit: "m2", metrado: 0.00, price: 0.00 }, // No data in image, placeholder
          { id: "408.A", code: "408.A", description: "ZANJA Y RELLENO PARA ANCLAJE DE GEOTEXTIL", unit: "ml", metrado: 3145.53, price: 19.72 },
          { id: "409.A", code: "409.A", description: "GEOTEXTIL NO TEJIDO CLASE 1, INCLUYE INSTALACION", unit: "m2", metrado: 285110.29, price: 12.57 },
          { id: "409.B", code: "409.B", description: "GEOTEXTIL NO TEJIDO CLASE 2, INCLUYE INSTALACION", unit: "m2", metrado: 30086.40, price: 8.49 },
          { id: "410.A", code: "410.A", description: "CONFORMACIÓN DE DME/DMO", unit: "m3", metrado: 519377.54, price: 3.51 }, // Sourced from page 1 summary if applicable
          { id: "410.B", code: "410.B", description: "CONFORMACIÓN DE MATERIAL EXCEDENTE EN TRASDOS DE DIQUE", unit: "m3", metrado: 0.00, price: 0.00 },
          { id: "412.A", code: "412.A", description: "RELLENO COMPACTADO CON MATERIAL PARA AFIRMADO EN CORONA", unit: "m3", metrado: 15144.09, price: 20.84 },
          { id: "413.A", code: "413.A", description: "RELLENO CON MATERIAL PROPIO", unit: "m3", metrado: 48850.10, price: 5.31 },
          { id: "414.A", code: "414.A", description: "TRATAMIENTO DE TALUD CON GEOCELDAS", unit: "m2", metrado: 24705.23, price: 77.37 },
          { id: "416.A", code: "416.A", description: "PERFILADO Y COMPACTACIÓN PARA FUNDACIÓN DE DIQUE", unit: "m2", metrado: 0.00, price: 0.00 }, // Data not explicitly in B1 summary image
        ]
      },
      {
        id: "B2", code: "B2", name: "REFUERZO EN DIQUES EXISTENTES",
        items: [
           { id: "402.B_R", code: "402.B", description: "EXCAVACIÓN MASIVA EN MATERIAL SUELTO, CON EQUIPO", unit: "m3", metrado: 68304.01, price: 10.68 },
           { id: "402.C_R", code: "402.C", description: "EXCAVACIÓN EN ROCA SUELTA CON EQUIPO", unit: "m3", metrado: 689.94, price: 18.38 },
           { id: "402.E_R", code: "402.E", description: "EXCAVACION DE UÑA EN MATERIAL CON NIVEL FREATICO", unit: "m3", metrado: 25731.75, price: 12.12 },
           { id: "403.A_R", code: "403.A", description: "CONFORMACIÓN Y COMPACTACIÓN DE DIQUE", unit: "m3", metrado: 24010.13, price: 14.26 },
           { id: "403.B_R", code: "403.B", description: "RECRECIMIENTO Y CONFORMACION EN DIQUE EXISTENTE", unit: "m3", metrado: 19231.97, price: 15.85 },
           { id: "404.G", code: "404.G", description: "ENROCADO Y ACOMODO DE ROCA EN TALUD DE DIQUE EXISTENTE", unit: "m3", metrado: 29970.61, price: 43.02 },
           { id: "404.H", code: "404.H", description: "ENROCADO Y ACOMODO DE ROCA EN UÑA DE DIQUE EXISTENTE", unit: "m3", metrado: 18918.89, price: 19.36 },
           { id: "406.A_R", code: "406.A'", description: "REFINE Y PERFILADO DE TALUD", unit: "m3", metrado: 0.00, price: 2.80 }, // Marked in red in source, assumed m2 or m3? Metrado missing in B2 summary image
           { id: "409.A_R", code: "409.A", description: "GEOTEXTIL NO TEJIDO CLASE 1, INCLUYE INSTALACION", unit: "m2", metrado: 52118.59, price: 12.57 },
           { id: "412.A_R", code: "412.A", description: "RELLENO COMPACTADO CON MATERIAL PARA AFIRMADO EN CORONA", unit: "m3", metrado: 10428.50, price: 20.84 },
           { id: "413.A_R", code: "413.A", description: "RELLENO CON MATERIAL PROPIO", unit: "m3", metrado: 8911.49, price: 5.31 },
           { id: "415.A", code: "415.A", description: "GAVIÓN (INCLUYE INSTALACIÓN)", unit: "m3", metrado: 8879.92, price: 297.43 },
           { id: "416.B", code: "416.B", description: "PERFILADO Y COMPACTACION DE CORONA EN DIQUE EXISTENTE", unit: "m3", metrado: 52142.50, price: 3.29 },
           { id: "417.A", code: "417.A", description: "RECUPERACION DE ROCA EN DIQUES EXISTENTES", unit: "m3", metrado: 63929.25, price: 37.17 },
        ]
      },
      {
        id: "500", code: "500", name: "TRANSPORTES DE MATERIAL",
        items: [
           { id: "501.A", code: "501.A", description: "CARGUIO Y ACARREO DE MATERIAL PROPIO P/DIQUE D<=1km", unit: "m3-km", metrado: 204289.91, price: 9.65 },
           { id: "502.A", code: "502.A", description: "ACARREO DE MATERIAL PROPIO P/DIQUE D>1km", unit: "m3-km", metrado: 66579.12, price: 2.62 },
           { id: "501.D", code: "501.D", description: "CARGUIO Y TRANSPORTE DE MATERIAL AFIRMADO D<=1KM", unit: "m3-km", metrado: 26074.68, price: 9.65 },
           { id: "502.D", code: "502.D", description: "TRANSPORTE DE MATERIAL AFIRMADO D>1KM", unit: "m3-km", metrado: 421140.23, price: 2.62 },
           { id: "503.B", code: "503.B", description: "CARGUIO Y TRANSPORTE DE MATERIAL EXCEDENTE CON EQUIPO D<= 1km", unit: "m3-km", metrado: 457052.22, price: 10.04 },
           { id: "504.B", code: "504.B", description: "TRANSPORTE DE MATERIAL EXCEDENTE CON EQUIPO D> 1km", unit: "m3-km", metrado: 9595410.80, price: 2.75 },
           { id: "505.B", code: "505.B", description: "CARGUIO Y TRANSPORTE DE ROCA SELECCIONADA D<=1km", unit: "m3-km", metrado: 254678.93, price: 12.85 },
           { id: "506.A", code: "506.A", description: "TRANSPORTE DE ROCA SELECCIONADA D >1km", unit: "m3-km", metrado: 2537049.44, price: 3.04 },
        ]
      }
    ]
  },
  {
    id: "C1",
    name: "C1 - OBRAS DE RIEGO",
    groups: [
      {
        id: "400", code: "400", name: "MOVIMIENTO DE TIERRAS",
        items: [
            { id: "402.B_RI", code: "402.B", description: "EXCAVACIÓN EN MATERIAL SUELTO, CON EQUIPO", unit: "m3", metrado: 5519.03, price: 12.60 },
            { id: "403.C", code: "403.C", description: "CONFORMACIÓN Y COMPACTACIÓN PARA ESTRUCTURA", unit: "m3", metrado: 418.05, price: 63.69 },
            { id: "404.F", code: "404.F", description: "ENROCADO Y ACOMODO DE ROCA", unit: "m3", metrado: 1162.62, price: 43.02 },
            { id: "413.A_RI", code: "413.A", description: "RELLENO CON MATERIAL PROPIO", unit: "m3", metrado: 1211.22, price: 5.31 },
            { id: "609.A", code: "609.A", description: "EMBOQUILLADO DE PIEDRA CON CONCRETO", unit: "m3", metrado: 169.85, price: 384.10 },
            { id: "801.A", code: "801.A", description: "CONCRETO PREMEZCLADO (f'c = 10 MPa) PARA SOLADO", unit: "m3", metrado: 24.70, price: 415.99 },
            { id: "801.B", code: "801.B", description: "CONCRETO CICLOPEO (f'c = 14 Mpa + 30% P.M.)", unit: "m3", metrado: 196.47, price: 353.11 },
            { id: "801.B1", code: "801.B1", description: "CONCRETO (f'c = 14 Mpa)", unit: "m3", metrado: 313.23, price: 431.16 },
            { id: "801.D", code: "801.D", description: "CONCRETO (f'c = 28 MPa) EN MUROS Y ZAPATAS", unit: "m3", metrado: 569.33, price: 608.87 },
            { id: "802.A", code: "802.A", description: "ACERO DE REFUERZO P/ESTRUCTURAS (fy= 420 Mpa)", unit: "kg", metrado: 16154.99, price: 8.04 },
            { id: "803.A", code: "803.A", description: "ENCOFRADO PLANO", unit: "m2", metrado: 2363.27, price: 61.02 },
            { id: "803.B", code: "803.B", description: "ENCOFRADO CURVO", unit: "m2", metrado: 140.86, price: 141.79 },
            { id: "805.A", code: "805.A", description: "TUBERÍA HDPE 600 mm (SUMINISTRO E INSTALACIÓN)", unit: "ml", metrado: 83.81, price: 648.22 },
            { id: "805.B", code: "805.B", description: "TUBERÍA HDPE 750 mm (SUMINISTRO E INSTALACIÓN)", unit: "ml", metrado: 24.70, price: 1528.76 },
            { id: "805.D", code: "805.D", description: "TUBERÍA HDPE 1000 mm (SUMINISTRO E INSTALACIÓN)", unit: "ml", metrado: 118.10, price: 2253.77 },
        ]
      }
    ]
  },
  {
    id: "C4",
    name: "C4 - CRUCE VIAL",
    groups: [
      {
        id: "C4_ALL", code: "C4", name: "OBRAS DE ARTE Y DRENAJE",
        items: [
           { id: "402.B_V", code: "402.B", description: "EXCAVACIÓN MASIVA EN MATERIAL SUELTO", unit: "m3", metrado: 26204.08, price: 7.62 },
           { id: "404.A_V", code: "404.A", description: "ENROCADO Y ACOMODO DE ROCA PARA PROTECCIÓN DE TALUD TIPO 1", unit: "m3", metrado: 6899.79, price: 43.02 },
           { id: "801.D_V", code: "801.D", description: "CONCRETO (f'c = 28 MPa) EN MUROS Y ZAPATAS", unit: "m3", metrado: 2026.15, price: 608.87 },
        ]
      }
    ]
  }
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Story (9:16)" },
  { value: "4:5", label: "Portrait (4:5)" },
];

export const IMAGE_SIZES: { value: ImageSize; label: string }[] = [
  { value: "1024x1024", label: "1080x1080" },
  { value: "1200x628", label: "1200x628" },
  { value: "1080x1920", label: "1080x1920" },
];

export const BANNER_STYLES: { value: BannerStyle; label: string; description: string }[] = [
  { value: "minimal", label: "Minimalist", description: "Clean, plenty of whitespace, focus on product." },
  { value: "vibrant", label: "Vibrant", description: "Bright colors, high energy, bold typography." },
  { value: "professional", label: "Professional", description: "Trustworthy, corporate, clean lines." },
  { value: "editorial", label: "Editorial", description: "Magazine style, elegant fonts, lifestyle focus." },
];

export const INITIAL_PROGRESS_ENTRIES: ProgressEntry[] = [
  {
    id: "INIT_PROG_1",
    date: "2024-08-15",
    dikeId: "DIPR_002_MD",
    progInicio: "0+000",
    progFin: "0+050",
    longitud: 50.00,
    tipoTerreno: "B1",
    tipoEnrocado: "TIPO 1",
    partida: "402.B",
    capa: "Capa 1",
    observaciones: "Avance importado: Excavación Masiva"
  }
];
