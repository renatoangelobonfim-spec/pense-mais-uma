(() => {
  const input = document.getElementById('busca');
  const filters = document.querySelector('.filtros');
  const groups = [...document.querySelectorAll('.prateleira')];
  const buttons = [...filters.querySelectorAll('button')];
  const normalize = s => s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let category = '';
  filters.hidden = false;
  function filter() {
    const words = normalize(input.value.trim()).split(/\s+/);
    let total = 0;
    groups.forEach(group => {
      let shown = 0;
      group.querySelectorAll('.verbete').forEach(link => {
        const text = normalize([link.textContent,link.dataset.k,group.dataset.group,link.getAttribute('href')].join(' '));
        link.hidden = Boolean(category && group.dataset.group !== category) || !words.every(w => text.includes(w));
        if (!link.hidden) shown++;
      });
      total += shown;
      group.hidden = !shown;
    });
    document.querySelector('.rn').textContent = total === 0 ? 'Nenhum curso encontrado. Tente outro termo ou escolha Todos.' : total === 1 ? '1 curso encontrado' : total + ' cursos gratuitos';
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    filter();
  }));
  input.addEventListener('input',filter);
})();
