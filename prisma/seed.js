import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/index.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MENU_CYCLES_DATA = [
  {
    id: 1,
    description: 'Siklus Menu 1',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Kuning', description: 'Nasi kuning disajikan dengan telur bumbu semur, bihun goreng' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Ayam', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ayam Ptg Bumbu Opor', description: 'Kuah, bistik tahu, tumis cistel jagung manis' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Udang Bakar Madu', description: 'Udang bakar yang dibaluri saus madu disajikan dengan nasi dan sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Potato + Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Beef Teriyaki', description: 'Disajikan dengan sup wortel labu, tempe kuning' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Spaghetti Bolognesse', description: 'Spaghetti pasta dengan saus bolognesse' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir' },
    ],
  },
  {
    id: 2,
    description: 'Siklus Menu 2',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Soto Betawi', description: 'Nasi dengan kuah soto betawi isi daging sapi, kentang, wortel' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Kuah Soto', description: 'Bubur nasi dengan kuah kari isian daging sapi dadu, telur rebus, dan sayuran' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Oatmeal', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dori Krispi Green SC', description: 'Disajikan dengan bistik tempe, capcay' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Sop Iga', description: 'Sop iga dengan isian wortel kentang disajikan dengan nasi' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Oni Squid', description: 'Nasi kepal yang disajikan dengan cumi dan sayuran' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Potong Kemangi', description: 'Disajikan dengan perkedel tahu, sup kepiting' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Chicken Parmiganna', description: 'Ayam fillet dengan perpaduan saus bechamel dan saus bbq, mix veggie, nasi, french fries, mashed potato' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Cream Soup + Crouton', description: 'Cream soup dengan isian mix veggie, smoked beef dan jamur kancing disajikan dengan roti panggang' },
    ],
  },
  {
    id: 3,
    description: 'Siklus Menu 3',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Hainan', description: 'Nasi dengan bumbu hainan disajikan dengan ayam panggang dan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Hainan', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dendeng Sapi', description: 'Disajikan dengan perkedel jagung/perkedel tempe, sayur asem' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Steak', description: 'Ayam panggang disajikan dengan saus bbq dan mix veggie, nasi, french fries, mashed potato' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Goreng Lengkuas', description: 'Disajikan dengan sup tahu, tumis wortel brokoli toge' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Farfalle Chicken Alfredo', description: 'Pasta farfalle saus alfredo disajikan dengan chicken breast dan mixed veggie' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Potato + Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
    ],
  },
  {
    id: 4,
    description: 'Siklus Menu 4',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Centil', description: 'Nasi yang disajikan dengan daging sapi dan tahu putih' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Centil', description: 'Tim yang disajikan dengan daging sapi dan tahu putih' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Centil', description: 'Bubur yang disajikan dengan daging sapi dan tahu putih' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Oatmeal', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Telur Ceplok Bumbu Kari', description: 'Disajikan dengan tempe masak bombay, cah sayur' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Ayam Madu', description: 'Ayam fillet saus madu disajikan dengan mix veggie dan nasi' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Fillet Barbeque', description: 'Disajikan dengan rolade tahu, sup bakso ikan' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Ifumi', description: 'Mie kering dengan isian udang dan sayuran' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
    ],
  },
  {
    id: 5,
    description: 'Siklus Menu 5',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Chicken Teriyaki', description: 'Nasi disajikan dengan ayam bumbu teriyaki dan cah tahu wortel brokoli' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Roti Oles + Telur', description: 'Roti panggang oles dengan telur orek/telur kukus' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Soto Bandung', description: 'Disajikan dengan pepes tahu' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Attahat', description: 'Ayam fillet yang disajikan dengan pasta dan mixed veggie' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dori Steak Bechamel Sauce', description: 'Disajikan dengan tempe bistik, sup oyong miesoa' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Risotto', description: 'Nasi dengan isian jamur kancing, smoked beef, ayam suwir dan keju' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa bumbu saus kecap dengan bakso dan ayam suwir' },
    ],
  },
  {
    id: 6,
    description: 'Siklus Menu 6',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Baked Rice', description: 'Nasi yang disajikan dengan ayam fillet panggang yang dibaluri saus demi glace dan mix veggie' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Daging Cincang', description: 'Nasi tim dengan isian tumis daging cincang dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Fuyunghai', description: 'Disajikan dengan tempe teriyaki, sayur asem' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Funghi', description: 'Chicken roll isian keju dan jamur saus bbq disajikan dengan sayuran, nasi, french fries, mashed potato' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Potong Kecap', description: 'Disajikan dengan bola-bola tahu panggang, tumis kimlo' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Semur Daging', description: 'Daging sapi dengan isian wortel kentang disajikan dengan nasi' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
      { mealTime: 'SORE', paketName: 'Paket D', name: 'Pangsit Seafood', description: 'Pangsit isi kuah udang disajikan dengan bihun, udang dan sayuran' },
    ],
  },
  {
    id: 7,
    description: 'Siklus Menu 7',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Aromatic', description: 'Nasi dengan rempah daun jeruk disajikan dengan tumis ayam, jamur' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Aromatic', description: 'Nasi tim dengan rempah daun jeruk disajikan dengan sautee ayam' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Beef Yakiniku', description: 'Disajikan dengan cah tahu, pakcoy garlic' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Curry Katsu', description: 'Ayam katsu dibaluri saus kari disajikan dengan nasi' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Spaghetti Carbonara', description: 'Spaghetti dengan saus carbonara' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Arsik Ikan', description: 'Disajikan dengan tempe bacem, sup sayur kuah kental' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Soto Lamongan', description: 'Soto kuning dengan isian tauge, ayam, telur disajikan dengan nasi' },
      { mealTime: 'SORE', paketName: 'Paket D', name: 'Chicken Salsa', description: 'Chicken breast salsa sauce disajikan dengan nasi dan sayuran' },
    ],
  },
  {
    id: 8,
    description: 'Siklus Menu 8',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Uduk', description: 'Cond: telur dadar iris, abon, tempe orek' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Ayam', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ikan Tumis Wijen', description: 'Rolade tahu, bobor bayam' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Schnitzel', description: 'Disajikan dengan french fries, mashed potato, nasi' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dadar Telur', description: 'Tempe kecap, tumis labu siam, wortel' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Tomyum', description: 'Miesoa kuah tomyum disajikan dengan udang' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
    ],
  },
  {
    id: 9,
    description: 'Siklus Menu 9',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Kebuli', description: 'Nasi dengan isian daging cincang, kismis, bumbu rempah disajikan telur iris dan kerupuk palembang' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Hainan', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Nasi', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Rolade Ayam', description: 'Disajikan dengan sup tahu isi, tumis sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Fettucini with Mushroom Sauce', description: 'Fettucini dengan saus mushroom' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Telur Kukus', description: 'Disajikan dengan tempe bistik, sayur lodeh' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Cumi Tahu Xiao', description: 'Cumi ditumis dengan tahu, ikan dengan saus xiao disajikan dengan nasi' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir' },
    ],
  },
  {
    id: 10,
    description: 'Siklus Menu 10',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Butter Rice + Beef Stroganoff', description: 'Daging sapi dibaluri dengan brown sauce dan jamur kancing disajikan dengan nasi' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Daging Cincang', description: 'Nasi tim dengan isian tumis daging cincang dan telur rebus disajikan dengan kuah kaldu' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ayam Garang Asem', description: 'Disajikan dengan sate tempe, tumis kimlo' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Schewan', description: 'Ayam fillet dibaluri saus schezwan disajikan dengan nasi dan sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dori Krispi with SC', description: 'Disajikan dengan loaf tahu, sup bening bayam jagung manis' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Pasta Pesto', description: 'Pasta dibaluri dengan bumbu pesto dan disajikan dengan ayam panggang' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
    ],
  },
  {
    id: 11,
    description: 'Siklus Menu 11 (Khusus Tanggal 31)',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Soto Ayam', description: 'Soto kuning dengan isian ayam, tauge, soun yang disajikan dengan nasi' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Oatmeal Banana Raisin', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin' },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dori Bumbu Woku', description: 'Disajikan dengan tempe kemangi, capcay' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Kebab', description: 'Kulit kebab dengan isian ayam fillet, mix veggie, mayonaisse' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Cah Jamur Kancing', description: 'Disajikan dengan tahu bumbu kari (kuah), sup baso mutiara' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Shrimp Noodle Soup', description: 'Mie dengan isian udang dan sayuran' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir' },
    ],
  },
];

async function main() {
  console.log('🚀 Memulai proses seeding database Menu Gizi...\n');

  // 1. Pastikan kolom description pada MenuItem ada di PostgreSQL & izin akses Supabase diberikan
  try {
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "description" TEXT;');
    await pool.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;');
    await pool.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;');
    console.log('✅ Verifikasi struktur tabel & izin akses Supabase berhasil.');
  } catch (err) {
    console.warn('⚠️ Catatan DDL / Permissions check:', err.message);
  }

  // 2. Seeding Patient Master Data (Testing / Dummy)
  const patientsData = [
    {
      rmNumber: 'RM-12345',
      name: 'Andi Pratama',
      dob: new Date('2003-02-01T00:00:00Z'),
      phone: '081234567890',
      roomName: 'LAVENDER 1 - 1.1',
      roomClass: 'VIP A',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-11111',
      name: 'Budi Santoso',
      dob: new Date('1980-05-15T00:00:00Z'),
      phone: '081111111111',
      roomName: 'LILY 2 - 2.1',
      roomClass: 'VIP C',
      allergies: 'Seafood, Kacang',
    },
    {
      rmNumber: 'RM-22222',
      name: 'Siti Aminah',
      dob: new Date('1995-10-20T00:00:00Z'),
      phone: '082222222222',
      roomName: 'LILAC 3 - 3.5',
      roomClass: 'VIP B',
      allergies: 'Telur, Susu Sapi',
    },
    {
      rmNumber: 'RM-33333',
      name: 'Dewi Lestari',
      dob: new Date('1988-12-05T00:00:00Z'),
      phone: '083333333333',
      roomName: 'ORCHID 1 - 1.1',
      roomClass: 'SUITE',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-44444',
      name: 'Hendra Wijaya',
      dob: new Date('1975-08-30T00:00:00Z'),
      phone: '084444444444',
      roomName: 'ALAMANDA 4 - 4.2',
      roomClass: 'JUNIOR SUITE',
      allergies: 'Coklat',
    },
    {
      rmNumber: 'RM-55555',
      name: 'Rina Kusuma',
      dob: new Date('2000-03-12T00:00:00Z'),
      phone: '085555555555',
      roomName: 'TULIP 1 - 1.3',
      roomClass: 'VIP D',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-66666',
      name: 'Agus Gunawan',
      dob: new Date('1965-11-25T00:00:00Z'),
      phone: '086666666666',
      roomName: 'TULIP 5 - 5.1',
      roomClass: 'VIP D',
      allergies: 'Udang',
    },
  ];

  const seededPatients = {};
  for (const p of patientsData) {
    const patientRecord = await prisma.patient.upsert({
      where: { rmNumber: p.rmNumber },
      update: {
        name: p.name,
        dob: p.dob,
        phone: p.phone,
        roomName: p.roomName,
        roomClass: p.roomClass,
        allergies: p.allergies,
      },
      create: p,
    });
    seededPatients[p.rmNumber] = patientRecord;
    console.log(`✅ Seeded Patient: ${patientRecord.name} (${patientRecord.rmNumber}) - Kamar: ${patientRecord.roomName}`);
  }

  // 3. Seeding Menu Cycles & Menu Items
  let totalItemsSeeded = 0;

  for (const cycleData of MENU_CYCLES_DATA) {
    const { id, description, items } = cycleData;

    // Upsert MenuCycle
    await prisma.menuCycle.upsert({
      where: { id },
      update: { description },
      create: { id, description },
    });

    // Hapus menu items lama untuk siklus ini agar tidak duplikat saat re-seed
    await prisma.menuItem.deleteMany({
      where: { cycleId: id },
    });

    // Create many menu items jika ada
    if (items.length > 0) {
      const created = await prisma.menuItem.createMany({
        data: items.map((item) => ({
          cycleId: id,
          mealTime: item.mealTime,
          paketName: item.paketName,
          name: item.name,
          description: item.description,
        })),
      });
      totalItemsSeeded += created.count;
    } else {
      console.log(`📦 [Siklus ${id}] ${description} -> (0 menu item / data kosong).`);
    }
  }

  // 4. Helper Seeder Orders untuk Tanggal Tertentu (Siklus 9 untuk 9 Sep & Siklus 10 untuk 10 Sep)
  const generateOrdersForDate = (targetDate, orderCreationDate, targetCycleId) => {
    const targetDateObj = new Date(targetDate);
    const orderCreatedObj = new Date(orderCreationDate);

    const cycleData = MENU_CYCLES_DATA.find((c) => c.id === targetCycleId) || MENU_CYCLES_DATA[0];

    const getMenuItem = (mealTime, paketLetter) => {
      const found = cycleData.items.find(
        (it) => it.mealTime === mealTime && (it.paketName || '').toUpperCase().includes(paketLetter.toUpperCase())
      );
      return found || { name: `Paket ${paketLetter} Spesial`, paketName: `Paket ${paketLetter}` };
    };

    const pad = (n) => String(n).padStart(2, '0');
    const dateCode = `${targetDateObj.getFullYear()}${pad(targetDateObj.getMonth() + 1)}${pad(targetDateObj.getDate())}`;
    const orders = [];

    const p1 = seededPatients['RM-12345']; // Andi Pratama (VIP A)
    const p2 = seededPatients['RM-11111']; // Budi Santoso (VIP C / Kelas 1, Alergi Udang)
    const p3 = seededPatients['RM-22222']; // Siti Aminah (VIP B, Alergi Telur/Susu)
    const p4 = seededPatients['RM-33333']; // Dewi Lestari (VIP A / Suite, Alergi Kacang)
    const p5 = seededPatients['RM-44444']; // Hendra Wijaya (Kelas 2)
    const p6 = seededPatients['RM-55555']; // Rina Kusuma (VIP A)
    const p7 = seededPatients['RM-66666']; // Agus Gunawan (Kelas 3, Alergi Ayam)

    const pagiA = getMenuItem('PAGI', 'A');
    const pagiB = getMenuItem('PAGI', 'B');
    const siangA = getMenuItem('SIANG', 'A');
    const siangB = getMenuItem('SIANG', 'B');
    const siangC = getMenuItem('SIANG', 'C');
    const soreA = getMenuItem('SORE', 'A');
    const soreB = getMenuItem('SORE', 'B');
    const soreC = getMenuItem('SORE', 'C');

    // -----------------------------------------------------------------
    // 1. Andi Pratama (VIP A) - 3 Kategori Lengkap
    // -----------------------------------------------------------------
    if (p1) {
      const code = `ORD-${dateCode}-001`;
      orders.push(
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: pagiA.name,
          paketName: pagiA.paketName || 'Paket A',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: pagiB.name,
          paketName: pagiB.paketName || 'Paket B',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: siangC.name || 'Paket C Spesial',
          paketName: siangC.paketName || 'Paket C',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'EXCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: soreA.name,
          paketName: soreA.paketName || 'Paket A',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        },
        {
          orderCode: code,
          patientId: p1.id,
          roomNumber: p1.roomName,
          classType: p1.roomClass,
          menuName: soreB.name,
          paketName: soreB.paketName || 'Paket B',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'EXCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Tolong makanan disajikan dalam kondisi hangat, jangan terlalu asin.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 2. Budi Santoso (VIP C / Kelas 1) [🔴 Alergi: Seafood, Udang]
    // -----------------------------------------------------------------
    if (p2) {
      const code = `ORD-${dateCode}-002`;
      orders.push(
        {
          orderCode: code,
          patientId: p2.id,
          roomNumber: p2.roomName,
          classType: p2.roomClass,
          menuName: pagiB.name,
          paketName: pagiB.paketName || 'Paket B',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi seafood & udang, mohon dipastikan wadah tidak tercampur.',
        },
        {
          orderCode: code,
          patientId: p2.id,
          roomNumber: p2.roomName,
          classType: p2.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi seafood & udang, mohon dipastikan wadah tidak tercampur.',
        },
        {
          orderCode: code,
          patientId: p2.id,
          roomNumber: p2.roomName,
          classType: p2.roomClass,
          menuName: soreA.name,
          paketName: soreA.paketName || 'Paket A',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi seafood & udang, mohon dipastikan wadah tidak tercampur.',
        },
        {
          orderCode: code,
          patientId: p2.id,
          roomNumber: p2.roomName,
          classType: p2.roomClass,
          menuName: soreC.name || soreB.name,
          paketName: soreC.paketName || 'Paket C',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'EXCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Alergi seafood & udang, mohon dipastikan wadah tidak tercampur.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 3. Siti Aminah (VIP B) [🔴 Alergi: Telur, Susu Sapi]
    // -----------------------------------------------------------------
    if (p3) {
      const code = `ORD-${dateCode}-003`;
      orders.push(
        {
          orderCode: code,
          patientId: p3.id,
          roomNumber: p3.roomName,
          classType: p3.roomClass,
          menuName: pagiA.name,
          paketName: pagiA.paketName || 'Paket A',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Diet DM (Diabetes Melitus), bebas olahan telur dan susu sapi.',
        },
        {
          orderCode: code,
          patientId: p3.id,
          roomNumber: p3.roomName,
          classType: p3.roomClass,
          menuName: pagiB.name,
          paketName: pagiB.paketName || 'Paket B',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Diet DM (Diabetes Melitus), bebas olahan telur dan susu sapi.',
        },
        {
          orderCode: code,
          patientId: p3.id,
          roomNumber: p3.roomName,
          classType: p3.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Diet DM (Diabetes Melitus), bebas olahan telur dan susu sapi.',
        },
        {
          orderCode: code,
          patientId: p3.id,
          roomNumber: p3.roomName,
          classType: p3.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'EXCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Diet DM (Diabetes Melitus), bebas olahan telur dan susu sapi.',
        },
        {
          orderCode: code,
          patientId: p3.id,
          roomNumber: p3.roomName,
          classType: p3.roomClass,
          menuName: soreA.name,
          paketName: soreA.paketName || 'Paket A',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Diet DM (Diabetes Melitus), bebas olahan telur dan susu sapi.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 4. Dewi Lestari (EDELWEISS SUITE 01) [🔴 Alergi: Kacang Tanah]
    // -----------------------------------------------------------------
    if (p4) {
      const code = `ORD-${dateCode}-004`;
      orders.push(
        {
          orderCode: code,
          patientId: p4.id,
          roomNumber: p4.roomName,
          classType: p4.roomClass,
          menuName: pagiA.name,
          paketName: pagiA.paketName || 'Paket A',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Mohon buah potong disajikan segar terpisah, tanpa bumbu kacang.',
        },
        {
          orderCode: code,
          patientId: p4.id,
          roomNumber: p4.roomName,
          classType: p4.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Mohon buah potong disajikan segar terpisah, tanpa bumbu kacang.',
        },
        {
          orderCode: code,
          patientId: p4.id,
          roomNumber: p4.roomName,
          classType: p4.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Mohon buah potong disajikan segar terpisah, tanpa bumbu kacang.',
        },
        {
          orderCode: code,
          patientId: p4.id,
          roomNumber: p4.roomName,
          classType: p4.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'EXCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Mohon buah potong disajikan segar terpisah, tanpa bumbu kacang.',
        },
        {
          orderCode: code,
          patientId: p4.id,
          roomNumber: p4.roomName,
          classType: p4.roomClass,
          menuName: soreB.name,
          paketName: soreB.paketName || 'Paket B',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Mohon buah potong disajikan segar terpisah, tanpa bumbu kacang.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 5. Hendra Wijaya (Kelas 2) [Tanpa Alergi]
    // -----------------------------------------------------------------
    if (p5) {
      const code = `ORD-${dateCode}-005`;
      orders.push(
        {
          orderCode: code,
          patientId: p5.id,
          roomNumber: p5.roomName,
          classType: p5.roomClass,
          menuName: pagiA.name,
          paketName: pagiA.paketName || 'Paket A',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Porsi nasi sedang, lauk dipisah kuahnya.',
        },
        {
          orderCode: code,
          patientId: p5.id,
          roomNumber: p5.roomName,
          classType: p5.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Porsi nasi sedang, lauk dipisah kuahnya.',
        },
        {
          orderCode: code,
          patientId: p5.id,
          roomNumber: p5.roomName,
          classType: p5.roomClass,
          menuName: soreB.name,
          paketName: soreB.paketName || 'Paket B',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Porsi nasi sedang, lauk dipisah kuahnya.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 6. Rina Kusuma (VIP A) [Tanpa Alergi]
    // -----------------------------------------------------------------
    if (p6) {
      const code = `ORD-${dateCode}-006`;
      orders.push(
        {
          orderCode: code,
          patientId: p6.id,
          roomNumber: p6.roomName,
          classType: p6.roomClass,
          menuName: pagiB.name,
          paketName: pagiB.paketName || 'Paket B',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Sayuran mohon dimasak lebih empuk/lunak.',
        },
        {
          orderCode: code,
          patientId: p6.id,
          roomNumber: p6.roomName,
          classType: p6.roomClass,
          menuName: siangA.name,
          paketName: siangA.paketName || 'Paket A',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Sayuran mohon dimasak lebih empuk/lunak.',
        },
        {
          orderCode: code,
          patientId: p6.id,
          roomNumber: p6.roomName,
          classType: p6.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Sayuran mohon dimasak lebih empuk/lunak.',
        },
        {
          orderCode: code,
          patientId: p6.id,
          roomNumber: p6.roomName,
          classType: p6.roomClass,
          menuName: soreA.name,
          paketName: soreA.paketName || 'Paket A',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Sayuran mohon dimasak lebih empuk/lunak.',
        },
        {
          orderCode: code,
          patientId: p6.id,
          roomNumber: p6.roomName,
          classType: p6.roomClass,
          menuName: soreB.name,
          paketName: soreB.paketName || 'Paket B',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PENDAMPING',
          notes: 'Sayuran mohon dimasak lebih empuk/lunak.',
        }
      );
    }

    // -----------------------------------------------------------------
    // 7. Agus Gunawan (Kelas 3) [🔴 Alergi: Daging Ayam]
    // -----------------------------------------------------------------
    if (p7) {
      const code = `ORD-${dateCode}-007`;
      orders.push(
        {
          orderCode: code,
          patientId: p7.id,
          roomNumber: p7.roomName,
          classType: p7.roomClass,
          menuName: pagiB.name,
          paketName: pagiB.paketName || 'Paket B',
          mealTime: 'PAGI',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 2,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi ayam, mohon lauk diganti telur atau tahu tempe.',
        },
        {
          orderCode: code,
          patientId: p7.id,
          roomNumber: p7.roomName,
          classType: p7.roomClass,
          menuName: siangB.name,
          paketName: siangB.paketName || 'Paket B',
          mealTime: 'SIANG',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi ayam, mohon lauk diganti telur atau tahu tempe.',
        },
        {
          orderCode: code,
          patientId: p7.id,
          roomNumber: p7.roomName,
          classType: p7.roomClass,
          menuName: soreB.name,
          paketName: soreB.paketName || 'Paket B',
          mealTime: 'SORE',
          servingDate: targetDateObj,
          createdAt: orderCreatedObj,
          quantity: 1,
          type: 'INCLUDE',
          consumer: 'PASIEN',
          notes: 'Alergi ayam, mohon lauk diganti telur atau tahu tempe.',
        }
      );
    }

    return orders;
  };

  // Tanggal Hari Ini (9 Sep 2026, Siklus 9, Dipesan Kemarin 8 Sep)
  const dateYesterday = new Date(2026, 8, 8, 10, 0, 0); // 8 Sep 2026
  const dateToday = new Date(2026, 8, 9, 12, 0, 0);     // 9 Sep 2026

  // Tanggal Besok (10 Sep 2026, Siklus 10, Dipesan Hari Ini 9 Sep)
  const dateTomorrow = new Date(2026, 8, 10, 12, 0, 0); // 10 Sep 2026

  const todayOrders = generateOrdersForDate(dateToday, dateYesterday, 9);
  const tomorrowOrders = generateOrdersForDate(dateTomorrow, dateToday, 10);
  const allOrdersToSeed = [...todayOrders, ...tomorrowOrders];

  // Hapus order sebelumnya untuk tanggal hari ini & besok agar tidak duplikasi
  const orderCodesToDelete = allOrdersToSeed.map((o) => o.orderCode);
  await prisma.order.deleteMany({
    where: {
      orderCode: {
        in: [...new Set(orderCodesToDelete)],
      },
    },
  });

  if (allOrdersToSeed.length > 0) {
    await prisma.order.createMany({
      data: allOrdersToSeed,
    });
  }

  const pad = (n) => String(n).padStart(2, '0');
  const formatLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  console.log(`\n📋 SEEDED ORDERS UNTUK 2 TANGGAL OPERASIONAL:`);
  console.log(`   📅 PENYAJIAN HARI INI (${formatLocal(dateToday)}) [SIKLUS 9 - Dipesan Kemarin ${formatLocal(dateYesterday)}]: ${todayOrders.length} item pesanan (7 Pasien)`);
  console.log(`   📅 PENYAJIAN BESOK / T+1 (${formatLocal(dateTomorrow)}) [SIKLUS 10 - Dipesan Hari Ini ${formatLocal(dateToday)}]: ${tomorrowOrders.length} item pesanan (7 Pasien)`);
  console.log(`   ✨ Termasuk variasi Kelas VIP A/B/C/Suite/Kelas 1-3, Pasien Alergi & Catatan Khusus.`);

  console.log(`\n🎉 SEEDING SELESAI! Total ${MENU_CYCLES_DATA.length} Siklus, ${totalItemsSeeded} Menu Item, dan ${allOrdersToSeed.length} item pesanan berhasil disimpan.`);
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
