let nextId = 1;
export const makeId = () => nextId++;
export const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);