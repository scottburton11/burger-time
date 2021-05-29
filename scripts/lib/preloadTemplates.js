export const preloadTemplates = async function () {
  const templatePaths = [
    'modules/burger-time/templates/hunger_table.html'
  ];

  return loadTemplates(templatePaths);
}
