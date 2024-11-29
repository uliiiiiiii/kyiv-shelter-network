export default function getMarkerColor(place: string): string {
    switch (place) {
      case 'Станція метрополітену':
        return 'green';
      case 'Підземний перехід': 
        return 'lime';
      case 'Укриття': 
        return 'yellow';
      case 'Підвал':
        return 'orange';
      case 'Цокольний поверх': 
        return 'darkorange';
      case 'Перший поверх':
        return 'red';
      case 'Підземний паркінг':
        return 'darkred';
      case 'Інше':
        return 'gray';
      default:
        return 'lightgray';
    }
  };