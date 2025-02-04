const { pathname } = location

if (pathname === '/js') {
  import('./examples/js')
}

if (pathname === '/react') {
  import('./examples/react')
}
