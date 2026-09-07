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
  const patient = await prisma.patient.upsert({
    where: { rmNumber: 'RM-12345' },
    update: {},
    create: {
      rmNumber: 'RM-12345',
      name: 'pasien',
      dob: new Date('2003-02-01T00:00:00Z'),
      phone: '081234567890',
      roomName: 'Mawar 101',
      roomClass: 'VIP_A',
      allergies: 'Tidak Ada',
      medicalConditions: 'Tidak Ada',
    },
  });
  console.log(`✅ Seeded Patient: ${patient.name} (${patient.rmNumber})`);

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

  // 4. Seeding Sample Orders untuk 1 Pasien (Pagi, Siang, Sore + Ekstra Sore)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const sampleOrderCode = 'ORD-' + tomorrow.toISOString().slice(0, 10).replace(/-/g, '') + '-001';

  // Hapus order contoh lama jika sudah ada dengan orderCode ini
  await prisma.order.deleteMany({
    where: { orderCode: sampleOrderCode },
  });

  const sampleOrdersData = [
    // 1. Sarapan (PAGI) - Include
    {
      orderCode: sampleOrderCode,
      patientId: patient.id,
      roomNumber: patient.roomName,
      classType: patient.roomClass,
      menuName: 'Nasi Uduk',
      paketName: 'Paket A',
      mealTime: 'PAGI',
      servingDate: tomorrow,
      quantity: 2, // VIP A: 2 porsi pagi
      type: 'INCLUDE',
      consumer: 'PASIEN',
      notes: 'Porsi hangat, jangan terlalu asin',
    },
    // 2. Makan Siang (SIANG) - Include
    {
      orderCode: sampleOrderCode,
      patientId: patient.id,
      roomNumber: patient.roomName,
      classType: patient.roomClass,
      menuName: 'Chicken Schnitzel',
      paketName: 'Paket B',
      mealTime: 'SIANG',
      servingDate: tomorrow,
      quantity: 1,
      type: 'INCLUDE',
      consumer: 'PASIEN',
      notes: 'Porsi hangat, jangan terlalu asin',
    },
    // 3. Makan Sore (SORE) - Include
    {
      orderCode: sampleOrderCode,
      patientId: patient.id,
      roomNumber: patient.roomName,
      classType: patient.roomClass,
      menuName: 'Dadar Telur',
      paketName: 'Paket A',
      mealTime: 'SORE',
      servingDate: tomorrow,
      quantity: 1,
      type: 'INCLUDE',
      consumer: 'PASIEN',
      notes: 'Porsi hangat, jangan terlalu asin',
    },
    // 4. Makan Sore (SORE) - Paket Ekstra (EXCLUDE / Berbayar)
    {
      orderCode: sampleOrderCode,
      patientId: patient.id,
      roomNumber: patient.roomName,
      classType: patient.roomClass,
      menuName: 'Tomyum',
      paketName: 'Paket B',
      mealTime: 'SORE',
      servingDate: tomorrow,
      quantity: 1,
      type: 'EXCLUDE',
      consumer: 'PENDAMPING',
      notes: 'Porsi hangat, jangan terlalu asin',
    },
  ];

  await prisma.order.createMany({
    data: sampleOrdersData,
  });

  console.log(`\n📋 Seeded Sample Order untuk Pasien ${patient.name} (${patient.rmNumber}):`);
  console.log(`   Order Code: ${sampleOrderCode}`);
  console.log(`   - Pagi   : Paket A (Nasi Uduk) - 2x [INCLUDE]`);
  console.log(`   - Siang  : Paket B (Chicken Schnitzel) - 1x [INCLUDE]`);
  console.log(`   - Sore   : Paket A (Dadar Telur) - 1x [INCLUDE]`);
  console.log(`   - Sore   : Paket B (Tomyum) - 1x [EXCLUDE/EKSTRA]`);
  console.log(`   - Catatan: "Porsi hangat, jangan terlalu asin"`);

  console.log(`\n🎉 SEEDING SELESAI! Total ${MENU_CYCLES_DATA.length} Siklus, ${totalItemsSeeded} Menu Item, dan sample pesanan telah tersimpan di database.`);
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
