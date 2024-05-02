export interface Estado {
  nombre: string;
  id: number;
}

export interface MaquinaTuring {
  descripcion: string;
  estados: Estado[];
  alfabeto: string[];
  blanco: string;
  estadoFinal: Estado;
  transiciones: Transicion[];
  estadoInicial: Estado;
  simbolos?: string[];
  cintaAlmacenada?: string;
  simboloAlmacenamiento: string;
}

export interface Transicion {
  id: number;
  desde: Estado;
  hacia: Estado;
  leer: string;
  escribir: string;
  almacenar?: string;
  direccion: string;
}
