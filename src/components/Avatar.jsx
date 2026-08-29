export default function Avatar({ name, variant = 'neutral' }) {
    const initials = (n) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    const styles = variant === 'pro'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-neutral-100 text-neutral-500 border-neutral-200';
  
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 ${styles}`}>
        {initials(name)}
      </div>
    );
  }