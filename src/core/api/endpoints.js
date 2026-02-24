export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
    changePassword: '/auth/change-password',
  },
  proyectos: {
    getAll: '/proyectos',
    create: '/proyectos',
    update: (id) => `/proyectos/${id}`,
    delete: (id) => `/proyectos/${id}`,
  },
  clientes: {
    getAll: '/clientes',
    create: '/clientes',
  },
  actividades: {
    getAll: '/actividades',
  },
  // ELIMINADO: precios
};