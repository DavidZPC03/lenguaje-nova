"use client"

import { Box, Button, Flex, Heading, IconButton, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { FiUpload, FiCode } from "react-icons/fi"
import { javascript } from "@codemirror/lang-javascript"
import ReactCodeMirror from "@uiw/react-codemirror"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  StatHelpText,
  Divider,
} from "@chakra-ui/react"
import type React from "react"
import { useState } from "react"

interface TokenDisplayProps {
  tokens: {
    type: string
    value: string
    line: number
  }[]
  errores: {
    line: number
    type: string
    message: string
  }[]
  syntaxResults?: {
    line: number
    valid: boolean
    message?: string
  }[]
  handleCodeChange: (code: string) => void
}

// Interfaz para representar una variable
interface Variable {
  name: string
  type: string
  value: string | null
  line: number
  column?: number
  isDeclared: boolean
  isValidName: boolean // Propiedad para verificar si el nombre es válido (comienza con _)
}

// Interfaz para representar un error semántico
interface SemanticError {
  message: string
  line: number
  type: string
  variable?: string
}

// Interfaz para representar el equilibrio de símbolos
interface SymbolBalance {
  type: string
  total: number
  opened: number
  closed: number
  isBalanced: boolean
}

// Definición de reglas sintácticas
const syntaxRules = [
  {
    name: "Declaración de variable sin asignación",
    pattern: ["TPINT", "IDEN", "CH;"],
    message: "Error en declaración de variable",
  },
  {
    name: "Declaración de variable con asignación",
    pattern: ["TPINT", "IDEN", "ASSGN", "NUMINT", "CH;"],
    message: "Error en declaración de variable con asignación",
  },
  {
    name: "Declaración de variable con asignación (flotante)",
    pattern: ["TPINT", "IDEN", "ASSGN", "NUMDB", "CH;"],
    message: "Error en declaración de variable con asignación (flotante)",
  },
  {
    name: "Declaración de variable con asignación (cadena)",
    pattern: ["TPSTR", "IDEN", "ASSGN", "STR", "CH;"],
    message: "Error en declaración de variable con asignación (cadena)",
  },
  {
    name: "If statement",
    pattern: ["IF", "CH(", "IDEN", "ROP>", "NUMINT", "CH)", "CH{"],
    message: "Error en estructura if",
  },
  {
    name: "Else statement",
    pattern: ["ELSE", "CH{"],
    message: "Error en estructura else",
  },
  {
    name: "Else if statement",
    pattern: ["ELSE", "IF", "CH(", "IDEN", "ROP>", "NUMINT", "CH)", "CH{"],
    message: "Error en estructura else if",
  },
  {
    name: "Output",
    pattern: ["OUT", "CH(", "STR", "CH)", "CH;"],
    message: "Error en llamada a output",
  },
  {
    name: "For loop",
    pattern: [
      "FOR",
      "CH(",
      "IDEN",
      "ASSGN",
      "NUMINT",
      "CH;",
      "IDEN",
      "ROP<",
      "NUMINT",
      "CH;",
      "IDEN",
      "AOP+",
      "AOP+",
      "CH)",
      "CH{",
    ],
    message: "Error en estructura for",
  },
  {
    name: "While loop",
    pattern: ["WHI", "CH(", "IDEN", "ROP<", "NUMINT", "CH)", "CH{"],
    message: "Error en estructura while",
  },
  {
    name: "Do statement",
    pattern: ["DO", "CH{"],
    message: "Error en estructura do",
  },
  {
    name: "Do-While loop (cierre)",
    pattern: ["CH}", "WHI", "CH(", "IDEN", "ROP<", "NUMINT", "CH)", "CH;"],
    message: "Error en cierre de estructura do-while",
  },
  {
    name: "Bloque vacío",
    pattern: ["CH}"],
    message: "Error en bloque vacío",
  },
  {
    name: "Asignación de variable",
    pattern: ["IDEN", "ASSGN", "NUMINT", "CH;"],
    message: "Error en asignación de variable",
  },
  {
    name: "Asignación de variable (flotante)",
    pattern: ["IDEN", "ASSGN", "NUMDB", "CH;"],
    message: "Error en asignación de variable (flotante)",
  },
  {
    name: "Asignación de variable (cadena)",
    pattern: ["IDEN", "ASSGN", "STR", "CH;"],
    message: "Error en asignación de variable (cadena)",
  },
  {
    name: "Función con retorno",
    pattern: ["FCTN", "TPINT", "IDEN", "CH(", "CH)", "CH{"],
    message: "Error en declaración de función con retorno",
  },
  {
    name: "Return statement",
    pattern: ["RTRN", "IDEN", "CH;"],
    message: "Error en estructura return",
  },
]

// Definición de tipos de datos
const dataTypes = {
  TPINT: "entero",
  TPDBL: "decimal",
  TPBOL: "booleano",
  TPSTR: "cadena",
  TPCHR: "caracter",
}

// Mapeo de tipos para normalizar nombres de tipos
const typeMapping = {
  int: "entero",
  double: "decimal",
  string: "cadena",
  boolean: "booleano",
  char: "caracter",
}

// Definición de símbolos de apertura y cierre
const openingSymbols = {
  "CH{": "llave",
  "CH(": "paréntesis",
  "CH[": "corchete",
}

const closingSymbols = {
  "CH}": "llave",
  "CH)": "paréntesis",
  "CH]": "corchete",
}

// Definición de estructuras de control
const controlStructures = {
  IF: { end: "CH}", type: "if" },
  ELSE: { end: "CH}", type: "else" },
  ELIF: { end: "CH}", type: "elseif" },
  FOR: { end: "CH}", type: "for" },
  WHI: { end: "CH}", type: "while" },
  DO: { end: "CH}", type: "do" },
  FCTN: { end: "CH}", type: "function" },
}

// Función para normalizar nombres de tipos
function normalizeType(typeName: string): string {
  return typeMapping[typeName as keyof typeof typeMapping] || typeName
}

// Función para inferir el tipo de un valor
function inferTypeFromValue(value: string): string {
  if (value === "true" || value === "false") return "booleano"
  if (/^-?\d+$/.test(value)) return "entero"
  if (/^-?\d+\.\d+$/.test(value)) return "decimal"
  if (/^["'].*["']$/.test(value)) return "cadena"
  if (/^['"].$/.test(value)) return "caracter"
  return "desconocido"
}

// Función para validar una línea de código
const validateLine = (lineTokens: Array<{ type: string; value: string }>) => {
  const tokenTypes = lineTokens.map((t) => t.type)

  // Caso especial para output
  if (tokenTypes[0] === "OUT") {
    return { valid: true }
  }

  // Caso especial para declaraciones de variables
  if (tokenTypes[0] === "TPINT" || tokenTypes[0] === "TPSTR" || tokenTypes[0] === "TPDBL") {
    if (tokenTypes[1] === "IDEN") {
      return { valid: true }
    }
  }

  // Caso especial para asignaciones
  if (tokenTypes[0] === "IDEN" && tokenTypes[1] === "ASSGN") {
    return { valid: true }
  }

  // Caso especial para estructuras de control
  if (
    tokenTypes[0] === "IF" ||
    tokenTypes[0] === "ELSE" ||
    tokenTypes[0] === "FOR" ||
    tokenTypes[0] === "WHI" ||
    tokenTypes[0] === "DO"
  ) {
    return { valid: true }
  }

  // Caso especial para funciones
  if (tokenTypes[0] === "FCTN") {
    return { valid: true }
  }

  // Caso especial para return
  if (tokenTypes[0] === "RTRN") {
    return { valid: true }
  }

  // Caso especial para llaves
  if (tokenTypes[0] === "CH{" || tokenTypes[0] === "CH}") {
    return { valid: true }
  }

  // Caso especial para cierre de bloque con else
  if (tokenTypes[0] === "CH}" && tokenTypes[1] === "ELSE") {
    return { valid: true }
  }

  // Caso especial para cierre de bloque con else if
  if (tokenTypes[0] === "CH}" && tokenTypes[1] === "ELSE" && tokenTypes[2] === "IF") {
    return { valid: true }
  }

  // Caso especial para cualquier cierre de bloque
  if (tokenTypes[0] === "CH}") {
    return { valid: true }
  }

  // Verificar reglas sintácticas definidas
  for (const rule of syntaxRules) {
    if (rule.pattern.length !== tokenTypes.length) continue // Saltar si no coinciden en longitud

    let match = true
    for (let i = 0; i < rule.pattern.length; i++) {
      if (rule.pattern[i] !== tokenTypes[i]) {
        match = false
        break
      }
    }

    if (match) {
      return { valid: true }
    }
  }

  return { valid: false, message: "Estructura no reconocida" }
}

// Función para verificar si un nombre de variable es válido (debe comenzar con guion bajo)
function isValidVariableName(name: string): boolean {
  return name.startsWith("_")
}

// Función para verificar si dos tipos son compatibles
function areTypesCompatible(type1: string, type2: string): boolean {
  // Normalizar tipos
  type1 = normalizeType(type1)
  type2 = normalizeType(type2)

  // Mismo tipo
  if (type1 === type2) return true

  // Conversiones permitidas
  if (type1 === "decimal" && type2 === "entero") return true
  if (type1 === "cadena" && type2 === "caracter") return true

  return false
}

export function Tokens({ tokens, errores, syntaxResults = [], handleCodeChange }: TokenDisplayProps) {
  const lines = tokens.reduce((acc: { [key: number]: Array<{ type: string; value: string }> }, token) => {
    if (!acc[token.line]) acc[token.line] = []
    acc[token.line].push({ type: token.type, value: token.value })
    return acc
  }, {})

  const { isOpen: isSyntaxOpen, onOpen: onSyntaxOpen, onClose: onSyntaxClose } = useDisclosure()
  const { isOpen: isSemanticOpen, onOpen: onSemanticOpen, onClose: onSemanticClose } = useDisclosure()

  // Estados para el análisis semántico
  const [semanticErrors, setSemanticErrors] = useState<SemanticError[]>([])
  const [variables, setVariables] = useState<Variable[]>([])
  const [symbolBalance, setSymbolBalance] = useState<SymbolBalance[]>([])
  const [controlStructureBalance, setControlStructureBalance] = useState<any[]>([])
  const [unusedStructures, setUnusedStructures] = useState<string[]>([])

  // Función para realizar el análisis semántico
  const performSemanticAnalysis = () => {
    // Extraer variables y verificar declaraciones
    const extractedVariables: Variable[] = []
    const errors: SemanticError[] = []

    // Verificar equilibrio de símbolos
    const symbolCounts = {
      llave: { total: 0, opened: 0, closed: 0 },
      paréntesis: { total: 0, opened: 0, closed: 0 },
      corchete: { total: 0, opened: 0, closed: 0 },
    }

    // Verificar estructuras de control
    const controlStructureCounts: { [key: string]: { count: number; lines: number[] } } = {}
    Object.keys(controlStructures).forEach((key) => {
      controlStructureCounts[key] = { count: 0, lines: [] }
    })

    // Seguimiento de bloques para estructuras de control
    const openBlocks: { type: string; line: number; blockLevel: number }[] = []
    let currentBlockLevel = 0

    // Variables para verificar funciones con retorno
    const functionReturnTypes: { [key: string]: string } = {}
    let currentFunction: string | null = null
    let currentFunctionType: string | null = null

    // Primero, procesar todos los tokens IDEN para detectar variables
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      // Detectar variables en tokens IDEN
      if (token.type === "IDEN") {
        const varName = token.value
        const isValidName = isValidVariableName(varName)

        // Verificar si la variable ya existe en nuestro registro
        const existingVar = extractedVariables.find((v) => v.name === varName)

        if (!existingVar) {
          // Agregar la variable a nuestro registro
          extractedVariables.push({
            name: varName,
            type: "desconocido", // El tipo se actualizará más adelante si es una declaración
            value: null,
            line: token.line,
            isDeclared: false, // Se actualizará más adelante si es una declaración
            isValidName: isValidName,
          })
        }

        // Si el nombre no es válido, agregar un error (siempre, incluso si ya existe)
        if (!isValidName) {
          // Verificar si ya existe un error para esta variable en esta línea
          const existingError = errors.some(
            (e) => e.type === "ERROR_NOMBRE_VARIABLE" && e.variable === varName && e.line === token.line,
          )

          if (!existingError) {
            errors.push({
              message: `Nombre de variable "${varName}" inválido. Debe comenzar con guion bajo (_)`,
              line: token.line,
              type: "ERROR_NOMBRE_VARIABLE",
              variable: varName,
            })
          }
        }
      }

      // Verificar funciones con retorno
      if (
        token.type === "FCTN" &&
        i + 2 < tokens.length &&
        (tokens[i + 1].type === "TPINT" || tokens[i + 1].type === "TPSTR" || tokens[i + 1].type === "TPDBL") &&
        tokens[i + 2].type === "IDEN"
      ) {
        const returnType = tokens[i + 1].value
        const functionName = tokens[i + 2].value
        functionReturnTypes[functionName] = returnType
        currentFunction = functionName
        currentFunctionType = returnType
      }

      // Verificar return en funciones
      if (token.type === "RTRN" && i + 1 < tokens.length && currentFunction && currentFunctionType) {
        const returnValue = tokens[i + 1]
        let returnValueType = "desconocido"

        if (returnValue.type === "NUMINT") {
          returnValueType = "entero"
        } else if (returnValue.type === "NUMDB") {
          returnValueType = "decimal"
        } else if (returnValue.type === "STR") {
          returnValueType = "cadena"
        } else if (returnValue.type === "IDEN") {
          // Buscar el tipo de la variable
          const varName = returnValue.value
          const variable = extractedVariables.find((v) => v.name === varName)
          if (variable && variable.type !== "desconocido") {
            returnValueType = variable.type
          }
        }

        // Verificar compatibilidad de tipos
        if (returnValueType !== "desconocido" && !areTypesCompatible(currentFunctionType, returnValueType)) {
          errors.push({
            message: `Tipo de retorno incompatible: función "${currentFunction}" espera "${normalizeType(currentFunctionType)}" pero retorna "${returnValueType}"`,
            line: token.line,
            type: "ERROR_TIPO_RETORNO",
          })
        }
      }

      // También buscar variables en condiciones de estructuras de control
      if (
        (token.type === "IF" ||
          token.type === "WHI" ||
          token.type === "FOR" ||
          (token.type === "ELSE" && i + 1 < tokens.length && tokens[i + 1].type === "IF")) &&
        i + 2 < tokens.length &&
        tokens[i + 1 + (token.type === "ELSE" ? 1 : 0)].type === "CH("
      ) {
        // Ajustar el índice de inicio para el caso de "else if"
        const startIdx = i + 2 + (token.type === "ELSE" ? 1 : 0)

        // Buscar todos los IDEN dentro de la condición hasta encontrar CH)
        let j = startIdx
        while (j < tokens.length && tokens[j].type !== "CH)") {
          if (tokens[j].type === "IDEN") {
            const varName = tokens[j].value
            const isValidName = isValidVariableName(varName)

            // Verificar si la variable ya existe
            const existingVar = extractedVariables.find((v) => v.name === varName)

            if (!existingVar) {
              // Agregar la variable
              extractedVariables.push({
                name: varName,
                type: "desconocido",
                value: null,
                line: tokens[j].line,
                isDeclared: false,
                isValidName: isValidName,
              })
            }

            // Si el nombre no es válido, agregar error
            if (!isValidName) {
              // Verificar si ya existe un error para esta variable en esta línea
              const existingError = errors.some(
                (e) => e.type === "ERROR_NOMBRE_VARIABLE" && e.variable === varName && e.line === tokens[j].line,
              )

              if (!existingError) {
                errors.push({
                  message: `Nombre de variable "${varName}" inválido. Debe comenzar con guion bajo (_)`,
                  line: tokens[j].line,
                  type: "ERROR_NOMBRE_VARIABLE",
                  variable: varName,
                })
              }
            }
          }
          j++
        }
      }

      // Buscar variables en condiciones de do-while (después del while)
      if (
        token.type === "WHI" &&
        i > 0 &&
        tokens[i - 1].type === "CH}" &&
        i + 1 < tokens.length &&
        tokens[i + 1].type === "CH("
      ) {
        // Buscar todos los IDEN dentro de la condición hasta encontrar CH)
        let j = i + 2
        while (j < tokens.length && tokens[j].type !== "CH)") {
          if (tokens[j].type === "IDEN") {
            const varName = tokens[j].value
            const isValidName = isValidVariableName(varName)

            // Verificar si la variable ya existe
            const existingVar = extractedVariables.find((v) => v.name === varName)

            if (!existingVar) {
              // Agregar la variable
              extractedVariables.push({
                name: varName,
                type: "desconocido",
                value: null,
                line: tokens[j].line,
                isDeclared: false,
                isValidName: isValidName,
              })
            }

            // Si el nombre no es válido, agregar error
            if (!isValidName) {
              // Verificar si ya existe un error para esta variable en esta línea
              const existingError = errors.some(
                (e) => e.type === "ERROR_NOMBRE_VARIABLE" && e.variable === varName && e.line === tokens[j].line,
              )

              if (!existingError) {
                errors.push({
                  message: `Nombre de variable "${varName}" inválido. Debe comenzar con guion bajo (_)`,
                  line: tokens[j].line,
                  type: "ERROR_NOMBRE_VARIABLE",
                  variable: varName,
                })
              }
            }
          }
          j++
        }
      }
    }

    // Ahora, procesar las declaraciones y asignaciones
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      // Verificar declaraciones de variables
      if (Object.keys(dataTypes).includes(token.type) && i + 1 < tokens.length && tokens[i + 1].type === "IDEN") {
        const varName = tokens[i + 1].value
        const varType = dataTypes[token.type as keyof typeof dataTypes]

        // Buscar la variable en nuestro registro
        const varIndex = extractedVariables.findIndex((v) => v.name === varName)

        if (varIndex !== -1) {
          // Actualizar la variable existente
          if (extractedVariables[varIndex].isDeclared) {
            // Variable ya declarada, agregar error de redeclaración
            errors.push({
              message: `Variable "${varName}" ya ha sido declarada`,
              line: token.line,
              type: "ERROR_REDECLARACION",
              variable: varName,
            })
          } else {
            // Actualizar la variable
            extractedVariables[varIndex].isDeclared = true
            extractedVariables[varIndex].type = varType
          }
        }
      }

      // Verificar asignaciones a variables
      if (token.type === "IDEN" && i + 1 < tokens.length && tokens[i + 1].type === "ASSGN") {
        const varName = token.value

        // Buscar la variable en nuestro registro
        const varIndex = extractedVariables.findIndex((v) => v.name === varName)

        if (varIndex !== -1 && extractedVariables[varIndex].isDeclared) {
          // Verificar tipo de asignación
          const valueTokenIndex = i + 2
          if (valueTokenIndex < tokens.length) {
            const valueToken = tokens[valueTokenIndex]
            let valueType = "desconocido"

            // Determinar el tipo del valor asignado
            if (valueToken.type === "NUMINT") {
              valueType = "entero"
            } else if (valueToken.type === "NUMDB") {
              valueType = "decimal"
            } else if (valueToken.type === "STR") {
              valueType = "cadena"
            } else if (valueToken.type === "TRUE" || valueToken.type === "FALSE") {
              valueType = "booleano"
            } else if (valueToken.type === "IDEN") {
              // Buscar el tipo de la variable
              const otherVarIndex = extractedVariables.findIndex((v) => v.name === valueToken.value)
              if (otherVarIndex !== -1 && extractedVariables[otherVarIndex].type !== "desconocido") {
                valueType = extractedVariables[otherVarIndex].type
              }
            }

            // Verificar compatibilidad de tipos
            if (extractedVariables[varIndex].type !== "desconocido" && valueType !== "desconocido") {
              if (!areTypesCompatible(extractedVariables[varIndex].type, valueType)) {
                // Verificar si ya existe un error para esta variable en esta línea
                const existingError = errors.some(
                  (e) => e.type === "ERROR_TIPO_INCOMPATIBLE" && e.line === token.line && e.variable === varName,
                )

                if (!existingError) {
                  errors.push({
                    message: `Tipo incompatible: variable "${varName}" es de tipo "${normalizeType(extractedVariables[varIndex].type)}" pero se le asigna un valor de tipo "${valueType}"`,
                    line: token.line,
                    type: "ERROR_TIPO_INCOMPATIBLE",
                    variable: varName,
                  })
                }
              }
            }

            // Actualizar valor de la variable
            extractedVariables[varIndex].value = valueToken.value
          }
        }
      }

      // Verificar operadores no soportados primero (independientemente de los operandos)
      if (token.type === "AOP%" || token.type === "AOP++" || token.type === "AOP--" || token.type === "AOPASSGN") {
        // Verificar si ya existe un error para este operador en esta línea
        const existingError = errors.some(
          (e) => e.type === "ERROR_OPERADOR_NO_SOPORTADO" && e.line === token.line && e.message.includes(token.value),
        )

        if (!existingError) {
          errors.push({
            message: `Operador "${token.value}" no soportado`,
            line: token.line,
            type: "ERROR_OPERADOR_NO_SOPORTADO",
          })
        }
      }

      // Verificar operaciones aritméticas con tipos incompatibles
      if (token.type.startsWith("AOP") && i > 0 && i + 1 < tokens.length) {
        const leftOperand = tokens[i - 1]
        const rightOperand = tokens[i + 1]

        // Verificar tipos de operandos
        let leftType = "desconocido"
        let rightType = "desconocido"

        if (leftOperand.type === "NUMINT") {
          leftType = "entero"
        } else if (leftOperand.type === "NUMDB") {
          leftType = "decimal"
        } else if (leftOperand.type === "IDEN") {
          const variable = extractedVariables.find((v) => v.name === leftOperand.value)
          if (variable && variable.type !== "desconocido") {
            leftType = variable.type
          }
        }

        if (rightOperand.type === "NUMINT") {
          rightType = "entero"
        } else if (rightOperand.type === "NUMDB") {
          rightType = "decimal"
        } else if (rightOperand.type === "IDEN") {
          const variable = extractedVariables.find((v) => v.name === rightOperand.value)
          if (variable && variable.type !== "desconocido") {
            rightType = variable.type
          }
        }

        // Verificar compatibilidad de tipos en operaciones aritméticas
        if (leftType !== "desconocido" && rightType !== "desconocido" && !areTypesCompatible(leftType, rightType)) {
          errors.push({
            message: `Tipos incompatibles en operación aritmética: "${normalizeType(leftType)}" ${token.value} "${normalizeType(rightType)}"`,
            line: token.line,
            type: "ERROR_TIPOS_OPERACION",
          })
        }
      }

      // Verificar estructuras de control incompletas
      if (token.type === "IF" || token.type === "WHI" || token.type === "FOR") {
        // Verificar si hay paréntesis para la condición
        if (i + 1 >= tokens.length || tokens[i + 1].type !== "CH(") {
          errors.push({
            message: `Estructura ${token.value} incompleta: falta paréntesis de apertura para la condición`,
            line: token.line,
            type: "ERROR_ESTRUCTURA_INCOMPLETA",
          })
        } else {
          // Buscar el paréntesis de cierre
          let foundClosingParen = false
          for (let j = i + 2; j < tokens.length && j < i + 20; j++) {
            if (tokens[j].line > token.line) break // No buscar en líneas posteriores
            if (tokens[j].type === "CH)") {
              foundClosingParen = true
              break
            }
          }

          if (!foundClosingParen) {
            errors.push({
              message: `Estructura ${token.value} incompleta: falta paréntesis de cierre para la condición`,
              line: token.line,
              type: "ERROR_ESTRUCTURA_INCOMPLETA",
            })
          }
        }

        // Para FOR, verificar si tiene los tres componentes
        if (token.type === "FOR") {
          let semicolonCount = 0
          for (let j = i + 2; j < tokens.length && j < i + 20; j++) {
            if (tokens[j].line > token.line) break
            if (tokens[j].type === "CH;") {
              semicolonCount++
            }
            if (tokens[j].type === "CH)") break
          }

          if (semicolonCount < 2) {
            errors.push({
              message: `Estructura FOR incompleta: debe tener inicialización, condición e incremento separados por punto y coma`,
              line: token.line,
              type: "ERROR_ESTRUCTURA_FOR_INCOMPLETA",
            })
          }
        }
      }

      // Verificar equilibrio de símbolos
      if (token.type in openingSymbols) {
        const symbolType = openingSymbols[token.type as keyof typeof openingSymbols]
        symbolCounts[symbolType as keyof typeof symbolCounts].opened++
        symbolCounts[symbolType as keyof typeof symbolCounts].total++

        // Si es una llave de apertura, incrementar el nivel de bloque
        if (token.type === "CH{") {
          currentBlockLevel++
        }
      }

      if (token.type in closingSymbols) {
        const symbolType = closingSymbols[token.type as keyof typeof closingSymbols]
        symbolCounts[symbolType as keyof typeof symbolCounts].closed++
        symbolCounts[symbolType as keyof typeof symbolCounts].total++

        // Si es una llave de cierre, decrementar el nivel de bloque y verificar si cierra alguna estructura
        if (token.type === "CH}") {
          currentBlockLevel--

          // Buscar la estructura de control más reciente que esté abierta
          if (openBlocks.length > 0) {
            const lastBlock = openBlocks.pop()
            if (lastBlock) {
              controlStructureCounts[lastBlock.type].count--
            }
          }

          // Si estamos cerrando una función, resetear el contexto de función actual
          if (currentFunction && currentBlockLevel === 0) {
            currentFunction = null
            currentFunctionType = null
          }
        }
      }

      // Verificar estructuras de control
      if (Object.keys(controlStructures).includes(token.type)) {
        controlStructureCounts[token.type].count++
        controlStructureCounts[token.type].lines.push(token.line)

        // Registrar la apertura de un bloque de estructura de control
        openBlocks.push({
          type: token.type,
          line: token.line,
          blockLevel: currentBlockLevel,
        })
      }
    }

    // Verificar variables no declaradas
    for (const variable of extractedVariables) {
      if (!variable.isDeclared) {
        errors.push({
          message: `Variable "${variable.name}" usada sin declarar`,
          line: variable.line,
          type: "VARIABLE_NO_DECLARADA",
          variable: variable.name,
        })
      }
    }

    // Verificar estructuras de control sin cerrar
    for (const [structureType, data] of Object.entries(controlStructureCounts)) {
      if (data.count > 0) {
        const structureInfo = controlStructures[structureType as keyof typeof controlStructures]
        errors.push({
          message: `Estructura ${structureInfo.type} sin cerrar (${data.count} sin cerrar)`,
          line: data.lines[0] || 0,
          type: "ESTRUCTURA_CONTROL",
        })
      }
    }

    // Preparar resultados para la visualización
    const balanceResults: SymbolBalance[] = []
    for (const [symbolType, counts] of Object.entries(symbolCounts)) {
      balanceResults.push({
        type: symbolType,
        total: counts.total,
        opened: counts.opened,
        closed: counts.closed,
        isBalanced: counts.opened === counts.closed,
      })

      if (counts.opened !== counts.closed) {
        errors.push({
          message: `Desequilibrio de ${symbolType}s: ${counts.opened} abiertos, ${counts.closed} cerrados`,
          line: 0,
          type: "DESEQUILIBRIO_SIMBOLOS",
        })
      }
    }

    // Preparar resultados de estructuras de control
    const controlResults = []
    const unusedStructures = []

    for (const [structureType, data] of Object.entries(controlStructureCounts)) {
      const structureInfo = controlStructures[structureType as keyof typeof controlStructures]
      const isUsed = data.lines.length > 0

      if (!isUsed) {
        unusedStructures.push(structureInfo.type)
      }

      controlResults.push({
        type: structureInfo.type,
        opened: data.count > 0 ? data.count : 0,
        closed: data.lines.length - data.count,
        isBalanced: data.count === 0,
        isUsed: isUsed,
      })
    }

    // Actualizar estados
    setVariables(extractedVariables)
    setSemanticErrors(errors)
    setSymbolBalance(balanceResults)
    setControlStructureBalance(controlResults)
    setUnusedStructures(unusedStructures)

    // Abrir el modal
    onSemanticOpen()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        handleCodeChange(text?.toString() || "")
      }
      reader.readAsText(file)
    }
  }

  const downloadTokens = () => {
    if (errores.length > 0) {
      alert("No puedes descargar los tokens debido a errores en el código.")
      return
    }

    const tokenText = Object.values(lines)
      .map((lineTokens) => lineTokens.map((t) => `${t.value} -> ${t.type}`).join(", "))
      .join("\n")
    const blob = new Blob([tokenText], { type: "text/plain" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = "tokens.nova"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar errores sintácticos para evitar que se muestren en la tabla de errores
  const filteredErrores = errores.filter((error) => error.type !== "SYNTAX_ERROR")

  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Heading fontSize={"2xl"} fontWeight={"semibold"}>
            Tokens
          </Heading>
        </Flex>
        <Flex justifyContent="flex-end" mt={2} mb={2} gap={2}>
          <Button onClick={performSemanticAnalysis} colorScheme="teal" leftIcon={<FiCode />}>
            Analizador Semántico
          </Button>
          <Button onClick={downloadTokens} colorScheme="blue" isDisabled={errores.length > 0}>
            Descargar tokens
          </Button>
          <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileUpload} accept=".nova" />
          <label htmlFor="fileInput">
            <IconButton as="span" colorScheme="gray" aria-label="Cargar archivo" icon={<FiUpload />} />
          </label>
          <Button onClick={onSyntaxOpen}>Mostrar análisis sintáctico</Button>
        </Flex>
        <Box mt={2} fontSize={"18px"} border="1px solid" rounded="md" borderColor={"#4b4d58"} boxShadow={"md"} p={2}>
          <ReactCodeMirror
            extensions={[javascript()]}
            value={Object.entries(lines)
              .map(
                ([lineNumber, lineTokens]) =>
                  `linea#${lineNumber}: ${lineTokens.map((t) => `${t.value} -> ${t.type}`).join(", ")}`,
              )
              .join("\n")}
            height="300px"
            theme="dark"
            contentEditable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
            }}
          />
        </Box>
      </Box>

      {/* Modal para análisis sintáctico */}
      <Modal isOpen={isSyntaxOpen} onClose={onSyntaxClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="rgba(0, 0, 0, 0.9)" color="white" borderRadius="md" maxW="800px" width="90%">
          <ModalHeader>Análisis Sintáctico</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {Object.entries(lines)
              .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
              .map(([lineNumber, lineTokens]) => {
                const line = Number.parseInt(lineNumber)

                // Validar la línea usando las reglas sintácticas
                const syntaxResult = syntaxResults.find((r) => r.line === line) || validateLine(lineTokens)

                const isValid = syntaxResult.valid
                const errorMessage = syntaxResult.message || "Error sintáctico"

                return (
                  <Box key={line} fontFamily="monospace" mb={3}>
                    <Text color="gray.300">
                      linea#{line}: {lineTokens.map((t) => `${t.value} -> ${t.type}`).join(", ")}
                    </Text>
                    {isValid ? (
                      <Text color="green.400">✓ Estructura válida</Text>
                    ) : (
                      <Text color="red.400">{errorMessage}</Text>
                    )}
                  </Box>
                )
              })}
            <Button onClick={onSyntaxClose} colorScheme="red" mt={4} width="full">
              Cerrar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para análisis semántico */}
      <Modal isOpen={isSemanticOpen} onClose={onSemanticClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white" color="black" borderRadius="md" maxW="800px" width="90%">
          <ModalHeader>Analizador Semántico</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs variant="enclosed" colorScheme="teal">
              <TabList>
                <Tab>Variables</Tab>
                <Tab>Errores</Tab>
                <Tab>Equilibrio</Tab>
              </TabList>

              <TabPanels>
                {/* Panel de Variables */}
                <TabPanel>
                  <Box mb={4}>
                    <Heading size="md" mb={2}>
                      Variables Detectadas
                    </Heading>
                    {variables.length > 0 ? (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Nombre</Th>
                            <Th>Tipo</Th>
                            <Th>Valor</Th>
                            <Th>Línea</Th>
                            <Th>Estado</Th>
                            <Th>Nombre Válido</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {variables.map((variable, index) => (
                            <Tr key={index}>
                              <Td>{variable.name}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    variable.type === "entero"
                                      ? "blue"
                                      : variable.type === "decimal"
                                        ? "purple"
                                        : variable.type === "booleano"
                                          ? "green"
                                          : variable.type === "cadena"
                                            ? "orange"
                                            : variable.type === "caracter"
                                              ? "pink"
                                              : "gray"
                                  }
                                >
                                  {variable.type}
                                </Badge>
                              </Td>
                              <Td>{variable.value || "null"}</Td>
                              <Td>{variable.line}</Td>
                              <Td>
                                <Badge colorScheme={variable.isDeclared ? "green" : "red"}>
                                  {variable.isDeclared ? "Declarada" : "No declarada"}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={variable.isValidName ? "green" : "red"}>
                                  {variable.isValidName ? "Válido" : "Inválido"}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No se detectaron variables</Text>
                    )}
                  </Box>
                </TabPanel>

                {/* Panel de Errores */}
                <TabPanel>
                  <Box>
                    <Heading size="md" mb={2}>
                      Errores Semánticos
                    </Heading>
                    {semanticErrors.length > 0 ? (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Tipo</Th>
                            <Th>Línea</Th>
                            <Th>Error</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {semanticErrors.map((error, index) => (
                            <Tr key={index}>
                              <Td>
                                <Badge colorScheme="red">
                                  {error.type.includes("ERROR_") ? error.type.replace("ERROR_", "") : error.type}
                                </Badge>
                              </Td>
                              <Td>{error.line > 0 ? error.line : "Global"}</Td>
                              <Td color="red.500">{error.message}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="green.500">No se encontraron errores semánticos</Text>
                    )}
                  </Box>
                </TabPanel>

                {/* Panel de Equilibrio */}
                <TabPanel>
                  <Box mb={4}>
                    <Heading size="md" mb={2}>
                      Equilibrio de Símbolos
                    </Heading>
                    <StatGroup mb={4}>
                      {symbolBalance.map((symbol, index) => (
                        <Stat key={index} textAlign="center" px={2} py={2} borderWidth="1px" borderRadius="md">
                          <StatLabel>{symbol.type.charAt(0).toUpperCase() + symbol.type.slice(1)}s</StatLabel>
                          <StatNumber>
                            {symbol.opened}/{symbol.closed}
                          </StatNumber>
                          <StatHelpText>
                            <Badge colorScheme={symbol.isBalanced ? "green" : "red"}>
                              {symbol.isBalanced ? "EQUILIBRADO" : "DESEQUILIBRADO"}
                            </Badge>
                          </StatHelpText>
                          <Progress
                            value={(symbol.closed / (symbol.opened || 1)) * 100}
                            colorScheme={symbol.isBalanced ? "green" : "red"}
                            size="sm"
                            mt={2}
                          />
                        </Stat>
                      ))}
                    </StatGroup>

                    <Divider my={4} />

                    <Heading size="md" mb={2}>
                      Estructuras de Control
                    </Heading>
                    <StatGroup mb={4}>
                      {controlStructureBalance.map((structure, index) => (
                        <Stat key={index} textAlign="center" px={2} py={2} borderWidth="1px" borderRadius="md">
                          <StatLabel>{structure.type.charAt(0).toUpperCase() + structure.type.slice(1)}</StatLabel>
                          <StatNumber>
                            {structure.opened}/{structure.opened + structure.closed}
                          </StatNumber>
                          <StatHelpText>
                            <Badge colorScheme={structure.isBalanced ? "green" : "red"}>
                              {structure.isBalanced ? "EQUILIBRADO" : "DESEQUILIBRADO"}
                            </Badge>
                          </StatHelpText>
                          <Progress
                            value={
                              structure.opened === 0 && structure.closed === 0
                                ? 100
                                : (structure.closed / (structure.opened + structure.closed || 1)) * 100
                            }
                            colorScheme={structure.isBalanced ? "green" : "red"}
                            size="sm"
                            mt={2}
                          />
                        </Stat>
                      ))}
                    </StatGroup>

                    <Divider my={4} />

                    <Heading size="md" mb={2}>
                      Estructuras No Utilizadas
                    </Heading>
                    {unusedStructures.length > 0 ? (
                      <Flex wrap="wrap" gap={2}>
                        {unusedStructures.map((structure, index) => (
                          <Badge key={index} colorScheme="gray" p={2} fontSize="md">
                            {structure.charAt(0).toUpperCase() + structure.slice(1)}
                          </Badge>
                        ))}
                      </Flex>
                    ) : (
                      <Text>Todas las estructuras están siendo utilizadas</Text>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Flex justify="space-between" mt={6}>
              <Button onClick={onSemanticClose} colorScheme="gray">
                Cerrar
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

