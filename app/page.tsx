
import styles from '@/styles/Home.module.css';
import 'leaflet/dist/leaflet.css';
import Map from '@/components/Map';

export default function Home() {
  return (
    <main className={styles.main}>
      <Map />
    </main>
  );
}