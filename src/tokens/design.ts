// src/tokens/design.ts
// ============================================
// DESIGN SYSTEM — MECURA MED (premium dark theme)
// ============================================

// Paleta de cores exclusiva
export const colors = {
  bg: {
    primary:   '#0A0A0F',   // fundo principal — dark total
    secondary: '#12121A',   // nav bar, tab bar
    card:      '#1A1A26',   // cards padrão
    input:     '#22222F',   // inputs, campos preenchíveis
    elevated:  '#2E2E40',   // bordas, separadores elevados
  },
  gold: {
    light:  '#E8C97A',
    main:   '#C9A84C',
    dark:   '#9B7A28',
    muted:  'rgba(201,168,76,0.12)',
    border: 'rgba(201,168,76,0.25)',
  },
  forest: {
    vivid:  '#4CAF72',   // verde vivo — online, sucesso, CTA
    main:   '#3D7A55',
    mid:    '#2D5A40',
    deep:   '#1B3A2A',
  },
  pearl:   '#F0EEE8',   // texto principal (quase branco, sem brilho)
  silver: {
    light:  '#C8C8DC',
    main:   '#9A9AB0',
    muted:  'rgba(154,154,176,0.12)',
  },
  status: {
    danger:  '#E05252',
    warning: '#E0A052',
    info:    '#5288E0',
    success: '#4CAF72',
  },
  queue: {
    waiting:    '#E0A052',   // amarelo/bege — aguardando
    inProgress: '#4CAF72',   // verde floresta — em atendimento
    done:       '#5288E0',   // azul — finalizado
  }
}

// Tipografia exclusiva — Cormorant Garamond + DM Sans
export const typography = {
  families: {
    display: 'CormorantGaramond', // títulos e chamadas
    body:    'DMSans',            // corpo de texto e botões
  },
  scale: {
    hero:    { size:36, weight:'300', font:'display', lineHeight:42 },
    h1:      { size:28, weight:'300', font:'display', lineHeight:34 },
    h2:      { size:22, weight:'400', font:'display', lineHeight:28 },
    h3:      { size:16, weight:'500', font:'body',    lineHeight:22 },
    body:    { size:14, weight:'400', font:'body',    lineHeight:21 },
    caption: { size:11, weight:'400', font:'body',    lineHeight:16 },
    label:   { size:10, weight:'500', font:'body',
               letterSpacing:2, textTransform:'uppercase' },
  }
}

// Espaçamentos — sistema espacial escalonado (px)
export const spacing = [0,4,8,12,16,20,24,32,40,48,64]

// Radius — cantos arredondados premium
export const radius  = { sm:8, md:12, lg:16, xl:24, pill:100 }

// Sombreamentos (elevate apenas para dark)
export const shadow = {
  card:    '0 2px 16px rgba(10,10,15,0.32)',
  popup:   '0 6px 32px rgba(20,20,30,0.48)',
  focus:   '0 0 0 2px #C9A84C',
}

// Outlines — foco acessibilidade
export const outline = {
  focus: '2px solid #C9A84C',
}

//
// Export padrão para import fácil
//
const design = { colors, typography, spacing, radius, shadow, outline }
export default design
