const icons = {
  'new': 'circle',
  'same': 'arrow-right',
  'improved': 'arrow-up',
  'declined': 'arrow-down'
}

export const getCompetencyIcon = ({ development }) => {
  const name = icons[development]
  return name || 'question'
}
