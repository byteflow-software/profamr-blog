document.addEventListener('DOMContentLoaded', function(){
  // Aponta para a UL principal de árvore
  document
    .querySelectorAll('.wiki-sidebar .wiki-tree li')
    .forEach(function(li){      
      const childUl = li.querySelector('ul.children');
      if (!childUl) return;

      li.classList.add('has-children');
      childUl.style.display = 'none';

      // cria a seta e insere ANTES do link
      const link   = li.querySelector('a');
      const toggle = document.createElement('span');
      toggle.classList.add('toggle');
      li.insertBefore(toggle, link);

      // só o clique na seta expande/colapsa
      toggle.addEventListener('click', function(e){
        e.stopPropagation();
        const isOpen = toggle.classList.toggle('open');
        childUl.style.display = isOpen ? 'block' : 'none';
      });
  });
});
