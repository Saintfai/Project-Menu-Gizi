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
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Kuning', description: 'Nasi kuning disajikan dengan telur bumbu semur, bihun goreng', karbohidrat: 'Nasi Kuning', protein: null, nabati: 'Bihun Goreng', proteinTambahan: 'Telur Bumbu Semur', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Ayam', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus', karbohidrat: 'Roti Panggang', protein: null, nabati: null, proteinTambahan: 'Telur Orek / Telur Kukus', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ayam Ptg Bumbu Opor', description: 'Kuah, bistik tahu, tumis cistel jagung manis', karbohidrat: 'Nasi Putih', protein: 'Ayam Potong Bumbu Opor', nabati: 'Bistik Tahu', proteinTambahan: null, sayur: 'Tumis Cistel Jagung Manis' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Udang Bakar Madu', description: 'Udang bakar yang dibaluri saus madu disajikan dengan nasi dan sayuran', karbohidrat: 'Nasi Putih', protein: 'Udang Bakar Madu', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Potato + Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Beef Teriyaki', description: 'Disajikan dengan sup wortel labu, tempe kuning', karbohidrat: 'Nasi Putih', protein: 'Beef Teriyaki', nabati: 'Tempe Kuning', proteinTambahan: null, sayur: 'Sup Wortel Labu' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Spaghetti Bolognesse', description: 'Spaghetti pasta dengan saus bolognesse', karbohidrat: 'Spaghetti', protein: 'Daging Sapi (Bolognesse)', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
    ],
  },
  {
    id: 2,
    description: 'Siklus Menu 2',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Soto Betawi', description: 'Nasi dengan kuah soto betawi isi daging sapi, kentang, wortel', karbohidrat: 'Nasi Putih', protein: 'Daging Sapi', nabati: null, proteinTambahan: null, sayur: 'Wortel, Kentang' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Kuah Soto', description: 'Bubur nasi dengan kuah kari isian daging sapi dadu, telur rebus, dan sayuran', karbohidrat: 'Bubur Nasi', protein: 'Daging Sapi Dadu', nabati: null, proteinTambahan: 'Telur Rebus', sayur: 'Mix Sayuran' },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Oatmeal', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin', karbohidrat: 'Oatmeal', protein: null, nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus', karbohidrat: 'Roti Panggang', protein: null, nabati: null, proteinTambahan: 'Telur Orek / Telur Kukus', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dori Krispi Green SC', description: 'Disajikan dengan bistik tempe, capcay', karbohidrat: 'Nasi Putih', protein: 'Ikan Dori Krispi', nabati: 'Bistik Tempe', proteinTambahan: null, sayur: 'Capcay' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Sop Iga', description: 'Sop iga dengan isian wortel kentang disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Iga Sapi', nabati: null, proteinTambahan: null, sayur: 'Wortel, Kentang' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Oni Squid', description: 'Nasi kepal yang disajikan dengan cumi dan sayuran', karbohidrat: 'Nasi Kepal', protein: 'Cumi', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Potong Kemangi', description: 'Disajikan dengan perkedel tahu, sup kepiting', karbohidrat: 'Nasi Putih', protein: 'Ayam Potong Kemangi', nabati: 'Perkedel Tahu', proteinTambahan: null, sayur: 'Sup Kepiting' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Chicken Parmiganna', description: 'Ayam fillet dengan perpaduan saus bechamel dan saus bbq, mix veggie, nasi, french fries, mashed potato', karbohidrat: 'Nasi / Mashed Potato / French Fries', protein: 'Chicken Fillet Parmiganna', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Cream Soup + Crouton', description: 'Cream soup dengan isian mix veggie, smoked beef dan jamur kancing disajikan dengan roti panggang', karbohidrat: 'Roti Panggang (Crouton)', protein: 'Smoked Beef', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie, Jamur Kancing' },
    ],
  },
  {
    id: 3,
    description: 'Siklus Menu 3',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Hainan', description: 'Nasi dengan bumbu hainan disajikan dengan ayam panggang dan kuah kaldu', karbohidrat: 'Nasi Hainan', protein: 'Ayam Panggang', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Hainan', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Bubur Nasi', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang', karbohidrat: 'Roti Panggang (Crouton)', protein: 'Smoked Beef', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dendeng Sapi', description: 'Disajikan dengan perkedel jagung/perkedel tempe, sayur asem', karbohidrat: 'Nasi Putih', protein: 'Dendeng Sapi', nabati: 'Perkedel Tempe', proteinTambahan: 'Perkedel Jagung', sayur: 'Sayur Asem' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Steak', description: 'Ayam panggang disajikan dengan saus bbq dan mix veggie, nasi, french fries, mashed potato', karbohidrat: 'Nasi / Mashed Potato / French Fries', protein: 'Chicken Steak', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Goreng Lengkuas', description: 'Disajikan dengan sup tahu, tumis wortel brokoli toge', karbohidrat: 'Nasi Putih', protein: 'Ayam Goreng Lengkuas', nabati: 'Sup Tahu', proteinTambahan: null, sayur: 'Tumis Wortel Brokoli Toge' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Farfalle Chicken Alfredo', description: 'Pasta farfalle saus alfredo disajikan dengan chicken breast dan mixed veggie', karbohidrat: 'Pasta Farfalle', protein: 'Chicken Breast', nabati: null, proteinTambahan: null, sayur: 'Mixed Veggie' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Potato + Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
    ],
  },
  {
    id: 4,
    description: 'Siklus Menu 4',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Centil', description: 'Nasi yang disajikan dengan daging sapi dan tahu putih', karbohidrat: 'Nasi Putih', protein: 'Daging Sapi', nabati: 'Tahu Putih', proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Centil', description: 'Tim yang disajikan dengan daging sapi dan tahu putih', karbohidrat: 'Nasi Tim', protein: 'Daging Sapi', nabati: 'Tahu Putih', proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Centil', description: 'Bubur yang disajikan dengan daging sapi dan tahu putih', karbohidrat: 'Bubur Nasi', protein: 'Daging Sapi', nabati: 'Tahu Putih', proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Oatmeal', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin', karbohidrat: 'Oatmeal', protein: null, nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Telur Ceplok Bumbu Kari', description: 'Disajikan dengan tempe masak bombay, cah sayur', karbohidrat: 'Nasi Putih', protein: null, nabati: 'Tempe Masak Bombay', proteinTambahan: 'Telur Ceplok Bumbu Kari', sayur: 'Cah Sayur' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Ayam Madu', description: 'Ayam fillet saus madu disajikan dengan mix veggie dan nasi', karbohidrat: 'Nasi Putih', protein: 'Ayam Fillet Saus Madu', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Fillet Barbeque', description: 'Disajikan dengan rolade tahu, sup bakso ikan', karbohidrat: 'Nasi Putih', protein: 'Ayam Fillet BBQ', nabati: 'Rolade Tahu', proteinTambahan: 'Bakso Ikan', sayur: null },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Ifumi', description: 'Mie kering dengan isian udang dan sayuran', karbohidrat: 'Ifumi (Mie Kering)', protein: 'Udang', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
    ],
  },
  {
    id: 5,
    description: 'Siklus Menu 5',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Chicken Teriyaki', description: 'Nasi disajikan dengan ayam bumbu teriyaki dan cah tahu wortel brokoli', karbohidrat: 'Nasi Putih', protein: 'Ayam Teriyaki', nabati: 'Tahu', proteinTambahan: null, sayur: 'Cah Wortel Brokoli' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Roti Oles + Telur', description: 'Roti panggang oles dengan telur orek/telur kukus', karbohidrat: 'Roti Panggang', protein: null, nabati: null, proteinTambahan: 'Telur Orek / Telur Kukus', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Soto Bandung', description: 'Disajikan dengan pepes tahu', karbohidrat: 'Nasi Putih', protein: 'Daging Sapi (Soto)', nabati: 'Pepes Tahu', proteinTambahan: null, sayur: null },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Attahat', description: 'Ayam fillet yang disajikan dengan pasta dan mixed veggie', karbohidrat: 'Pasta', protein: 'Chicken Fillet', nabati: null, proteinTambahan: null, sayur: 'Mixed Veggie' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dori Steak Bechamel Sauce', description: 'Disajikan dengan tempe bistik, sup oyong miesoa', karbohidrat: 'Nasi Putih', protein: 'Ikan Dori Steak', nabati: 'Tempe Bistik', proteinTambahan: null, sayur: 'Sup Oyong Miesoa' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Risotto', description: 'Nasi dengan isian jamur kancing, smoked beef, ayam suwir dan keju', karbohidrat: 'Risotto (Nasi)', protein: 'Smoked Beef, Ayam Suwir', nabati: null, proteinTambahan: 'Keju', sayur: 'Jamur Kancing' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa bumbu saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
    ],
  },
  {
    id: 6,
    description: 'Siklus Menu 6',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Baked Rice', description: 'Nasi yang disajikan dengan ayam fillet panggang yang dibaluri saus demi glace dan mix veggie', karbohidrat: 'Nasi Putih (Baked)', protein: 'Ayam Fillet Panggang', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Daging Cincang', description: 'Nasi tim dengan isian tumis daging cincang dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Daging Cincang', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Bubur Nasi', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang', karbohidrat: 'Roti Panggang (Crouton)', protein: 'Smoked Beef', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Fuyunghai', description: 'Disajikan dengan tempe teriyaki, sayur asem', karbohidrat: 'Nasi Putih', protein: null, nabati: 'Tempe Teriyaki', proteinTambahan: 'Fuyunghai (Telur Dadar Isi)', sayur: 'Sayur Asem' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Funghi', description: 'Chicken roll isian keju dan jamur saus bbq disajikan dengan sayuran, nasi, french fries, mashed potato', karbohidrat: 'Nasi / French Fries / Mashed Potato', protein: 'Chicken Roll (Keju, Jamur)', nabati: null, proteinTambahan: 'Keju', sayur: 'Mix Sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Potong Kecap', description: 'Disajikan dengan bola-bola tahu panggang, tumis kimlo', karbohidrat: 'Nasi Putih', protein: 'Ayam Potong Kecap', nabati: 'Bola-bola Tahu Panggang', proteinTambahan: null, sayur: 'Tumis Kimlo' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Semur Daging', description: 'Daging sapi dengan isian wortel kentang disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Daging Sapi Semur', nabati: null, proteinTambahan: null, sayur: 'Wortel, Kentang' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
      { mealTime: 'SORE', paketName: 'Paket D', name: 'Pangsit Seafood', description: 'Pangsit isi kuah udang disajikan dengan bihun, udang dan sayuran', karbohidrat: 'Pangsit, Bihun', protein: 'Udang', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
    ],
  },
  {
    id: 7,
    description: 'Siklus Menu 7',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Aromatic', description: 'Nasi dengan rempah daun jeruk disajikan dengan tumis ayam, jamur', karbohidrat: 'Nasi Aromatic', protein: 'Tumis Ayam', nabati: null, proteinTambahan: null, sayur: 'Jamur' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Aromatic', description: 'Nasi tim dengan rempah daun jeruk disajikan dengan sautee ayam', karbohidrat: 'Nasi Tim Aromatic', protein: 'Sautee Ayam', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Ayam', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Bubur Nasi', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus', karbohidrat: 'Roti Panggang', protein: null, nabati: null, proteinTambahan: 'Telur Orek / Telur Kukus', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Beef Yakiniku', description: 'Disajikan dengan cah tahu, pakcoy garlic', karbohidrat: 'Nasi Putih', protein: 'Beef Yakiniku', nabati: 'Cah Tahu', proteinTambahan: null, sayur: 'Pakcoy Garlic' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Curry Katsu', description: 'Ayam katsu dibaluri saus kari disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Ayam Katsu Kari', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Spaghetti Carbonara', description: 'Spaghetti dengan saus carbonara', karbohidrat: 'Spaghetti', protein: 'Smoked Beef (Carbonara)', nabati: null, proteinTambahan: 'Keju, Telur (Carbonara)', sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Arsik Ikan', description: 'Disajikan dengan tempe bacem, sup sayur kuah kental', karbohidrat: 'Nasi Putih', protein: 'Arsik Ikan', nabati: 'Tempe Bacem', proteinTambahan: null, sayur: 'Sup Sayur Kuah Kental' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Soto Lamongan', description: 'Soto kuning dengan isian tauge, ayam, telur disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur', sayur: 'Tauge' },
      { mealTime: 'SORE', paketName: 'Paket D', name: 'Chicken Salsa', description: 'Chicken breast salsa sauce disajikan dengan nasi dan sayuran', karbohidrat: 'Nasi Putih', protein: 'Chicken Breast Salsa', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
    ],
  },
  {
    id: 8,
    description: 'Siklus Menu 8',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Uduk', description: 'Cond: telur dadar iris, abon, tempe orek', karbohidrat: 'Nasi Uduk', protein: 'Abon', nabati: 'Tempe Orek', proteinTambahan: 'Telur Dadar Iris', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Ayam', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang', karbohidrat: 'Roti Panggang (Crouton)', protein: 'Smoked Beef', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ikan Tumis Wijen', description: 'Rolade tahu, bobor bayam', karbohidrat: 'Nasi Putih', protein: 'Ikan Tumis Wijen', nabati: 'Rolade Tahu', proteinTambahan: null, sayur: 'Bobor Bayam' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Schnitzel', description: 'Disajikan dengan french fries, mashed potato, nasi', karbohidrat: 'Nasi / French Fries / Mashed Potato', protein: 'Chicken Schnitzel', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dadar Telur', description: 'Tempe kecap, tumis labu siam, wortel', karbohidrat: 'Nasi Putih', protein: null, nabati: 'Tempe Kecap', proteinTambahan: 'Dadar Telur', sayur: 'Tumis Labu Siam, Wortel' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Tomyum', description: 'Miesoa kuah tomyum disajikan dengan udang', karbohidrat: 'Miesoa', protein: 'Udang', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran (Tomyum)' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
    ],
  },
  {
    id: 9,
    description: 'Siklus Menu 9',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Nasi Kebuli', description: 'Nasi dengan isian daging cincang, kismis, bumbu rempah disajikan telur iris dan kerupuk palembang', karbohidrat: 'Nasi Kebuli', protein: 'Daging Cincang', nabati: null, proteinTambahan: 'Telur Iris', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Hainan', description: 'Nasi tim dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Nasi', description: 'Bubur nasi dengan isian ayam suwir dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Bubur Nasi', protein: 'Ayam Suwir', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket E', name: 'Cream Soup + Crouton', description: 'Soup creamy dengan isian sayuran dan smoked beef disajikan dengan roti panggang', karbohidrat: 'Roti Panggang (Crouton)', protein: 'Smoked Beef', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Rolade Ayam', description: 'Disajikan dengan sup tahu isi, tumis sayuran', karbohidrat: 'Nasi Putih', protein: 'Rolade Ayam', nabati: 'Sup Tahu Isi', proteinTambahan: null, sayur: 'Tumis Sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Fettucini with Mushroom Sauce', description: 'Fettucini dengan saus mushroom', karbohidrat: 'Pasta Fettucini', protein: null, nabati: null, proteinTambahan: null, sayur: 'Jamur (Mushroom Sauce)' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Telur Kukus', description: 'Disajikan dengan tempe bistik, sayur lodeh', karbohidrat: 'Nasi Putih', protein: null, nabati: 'Tempe Bistik', proteinTambahan: 'Telur Kukus', sayur: 'Sayur Lodeh' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Cumi Tahu Xiao', description: 'Cumi ditumis dengan tahu, ikan dengan saus xiao disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Cumi, Ikan Saus Xiao', nabati: 'Tahu', proteinTambahan: null, sayur: null },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
    ],
  },
  {
    id: 10,
    description: 'Siklus Menu 10',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Butter Rice + Beef Stroganoff', description: 'Daging sapi dibaluri dengan brown sauce dan jamur kancing disajikan dengan nasi', karbohidrat: 'Butter Rice', protein: 'Beef Stroganoff', nabati: null, proteinTambahan: null, sayur: 'Jamur Kancing' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Tim Daging Cincang', description: 'Nasi tim dengan isian tumis daging cincang dan telur rebus disajikan dengan kuah kaldu', karbohidrat: 'Nasi Tim', protein: 'Daging Cincang', nabati: null, proteinTambahan: 'Telur Rebus', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Ayam Garang Asem', description: 'Disajikan dengan sate tempe, tumis kimlo', karbohidrat: 'Nasi Putih', protein: 'Ayam Garang Asem', nabati: 'Sate Tempe', proteinTambahan: null, sayur: 'Tumis Kimlo' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Chicken Schewan', description: 'Ayam fillet dibaluri saus schezwan disajikan dengan nasi dan sayuran', karbohidrat: 'Nasi Putih', protein: 'Chicken Fillet Schezwan', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Misoa Kuah Baso', description: 'Misoa disajikan dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Dori Krispi with SC', description: 'Disajikan dengan loaf tahu, sup bening bayam jagung manis', karbohidrat: 'Nasi Putih', protein: 'Ikan Dori Krispi', nabati: 'Loaf Tahu', proteinTambahan: null, sayur: 'Sup Bening Bayam, Jagung Manis' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Pasta Pesto', description: 'Pasta dibaluri dengan bumbu pesto dan disajikan dengan ayam panggang', karbohidrat: 'Pasta Pesto', protein: 'Ayam Panggang', nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
    ],
  },
  {
    id: 11,
    description: 'Siklus Menu 11 (Khusus Tanggal 31)',
    items: [
      // Sarapan / Breakfast (PAGI)
      { mealTime: 'PAGI', paketName: 'Paket A', name: 'Soto Ayam', description: 'Soto kuning dengan isian ayam, tauge, soun yang disajikan dengan nasi', karbohidrat: 'Nasi Putih', protein: 'Ayam Suwir', nabati: null, proteinTambahan: null, sayur: 'Tauge, Soun' },
      { mealTime: 'PAGI', paketName: 'Paket B', name: 'Bubur Sumsum', description: 'Bubur sumsum dengan kinca disajikan dengan telur rebus/telur orek', karbohidrat: 'Bubur Sumsum', protein: null, nabati: null, proteinTambahan: 'Telur Rebus / Telur Orek', sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket C', name: 'Oatmeal Banana Raisin', description: 'Bubur oatmeal disajikan dengan potongan pisang dan raisin', karbohidrat: 'Oatmeal', protein: null, nabati: null, proteinTambahan: null, sayur: null },
      { mealTime: 'PAGI', paketName: 'Paket D', name: 'Roti Oles + Telur Rebus', description: 'Roti panggang oles dengan telur orek/telur kukus', karbohidrat: 'Roti Panggang', protein: null, nabati: null, proteinTambahan: 'Telur Orek / Telur Kukus', sayur: null },
      // Makan Siang / Lunch (SIANG)
      { mealTime: 'SIANG', paketName: 'Paket A', name: 'Dori Bumbu Woku', description: 'Disajikan dengan tempe kemangi, capcay', karbohidrat: 'Nasi Putih', protein: 'Ikan Dori Bumbu Woku', nabati: 'Tempe Kemangi', proteinTambahan: null, sayur: 'Capcay' },
      { mealTime: 'SIANG', paketName: 'Paket B', name: 'Mashed Omelette', description: 'Telur dengan isian smoked beef, keju, susu yang disajikan dengan kentang mashed', karbohidrat: 'Mashed Potato', protein: 'Smoked Beef', nabati: null, proteinTambahan: 'Omelette (Telur, Keju, Susu)', sayur: null },
      { mealTime: 'SIANG', paketName: 'Paket C', name: 'Kebab', description: 'Kulit kebab dengan isian ayam fillet, mix veggie, mayonaisse', karbohidrat: 'Kulit Kebab (Roti)', protein: 'Ayam Fillet', nabati: null, proteinTambahan: null, sayur: 'Mix Veggie' },
      // Makan Sore / Dinner (SORE)
      { mealTime: 'SORE', paketName: 'Paket A', name: 'Ayam Cah Jamur Kancing', description: 'Disajikan dengan tahu bumbu kari (kuah), sup baso mutiara', karbohidrat: 'Nasi Putih', protein: 'Ayam Cah Jamur', nabati: 'Tahu Bumbu Kari', proteinTambahan: 'Baso Mutiara', sayur: 'Jamur Kancing' },
      { mealTime: 'SORE', paketName: 'Paket B', name: 'Shrimp Noodle Soup', description: 'Mie dengan isian udang dan sayuran', karbohidrat: 'Mie', protein: 'Udang', nabati: null, proteinTambahan: null, sayur: 'Mix Sayuran' },
      { mealTime: 'SORE', paketName: 'Paket C', name: 'Misoa Yamin Baso', description: 'Misoa dibaluri saus kecap dengan bakso dan ayam suwir', karbohidrat: 'Misoa', protein: 'Bakso, Ayam Suwir', nabati: null, proteinTambahan: null, sayur: null },
    ],
  },
];

async function main() {
  console.log('ðŸš€ Memulai proses seeding database Menu Gizi...\n');

  // 1. Pastikan kolom description pada MenuItem ada di PostgreSQL & izin akses Supabase diberikan
  try {
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "description" TEXT;');
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "karbohidrat" TEXT;');
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "protein" TEXT;');
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "nabati" TEXT;');
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "proteinTambahan" TEXT;');
    await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "sayur" TEXT;');

    // â”€â”€â”€ SECURITY FIX: Minimal privilege grants (no more GRANT ALL to anon) â”€â”€â”€
    // Revoke previous overly-permissive grants first
    await pool.query('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;');
    await pool.query('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;');

    // anon/authenticated: Read-only on master data
    await pool.query('GRANT SELECT ON "MenuCycle", "MenuItem" TO anon, authenticated;');
    // anon/authenticated: Read patients (for login lookup)
    await pool.query('GRANT SELECT ON "Patient" TO anon, authenticated;');
    // anon/authenticated: Read + Insert orders (patients placing orders)
    await pool.query('GRANT SELECT, INSERT ON "Order" TO anon, authenticated;');
    // anon/authenticated: Sequence usage for UUID generation
    await pool.query('GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;');

    // service_role keeps full access (used only server-side, never in frontend)
    await pool.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;');
    await pool.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;');

    console.log('âœ… Verifikasi struktur tabel & izin akses Supabase berhasil (minimal privileges).');
  } catch (err) {
    console.warn('âš ï¸ Catatan DDL / Permissions check:', err.message);
  }

  // 2. Seeding Patient Master Data (Testing / Dummy)
  const patientsData = [
    {
      rmNumber: 'RM-12345',
      name: 'Andi Pratama',
      dob: new Date('2003-02-01T00:00:00Z'),
      phone: '081234567890',
      address: 'Komplek Dago Resort, Cluster Pine Hill Blok B2 No. 15, Cibeunying Kaler, Bandung',
      roomName: 'LAVENDER 1 - 1.1',
      roomClass: 'VIP A',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-11111',
      name: 'Budi Santoso',
      dob: new Date('1980-05-15T00:00:00Z'),
      phone: '081111111111',
      address: 'Apartemen Grand Asia Afrika Tower B Lt. 12 Unit 1205, Lengkong, Bandung',
      roomName: 'LILY 2 - 2.1',
      roomClass: 'VIP C',
      allergies: 'Seafood, Kacang',
    },
    {
      rmNumber: 'RM-22222',
      name: 'Siti Aminah',
      dob: new Date('1995-10-20T00:00:00Z'),
      phone: '082222222222',
      address: 'Gang Hj. Umayah II No. 24 RT 03/RW 07, Kel. Sekeloa, Kec. Coblong, Bandung',
      roomName: 'LILAC 3 - 3.5',
      roomClass: 'VIP B',
      allergies: 'Telur, Susu Sapi',
    },
    {
      rmNumber: 'RM-33333',
      name: 'Dewi Lestari',
      dob: new Date('1988-12-05T00:00:00Z'),
      phone: '083333333333',
      address: 'Perumahan Setiabudi Regency, Jalan Cemara Highland Kav. 8A, Parongpong',
      roomName: 'ORCHID 1 - 1.1',
      roomClass: 'SUITE',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-44444',
      name: 'Hendra Wijaya',
      dob: new Date('1975-08-30T00:00:00Z'),
      phone: '084444444444',
      address: 'Dusun Mekar Wangi RT 02/RW 05, Desa Ciburial, Kec. Cimenyan, Kab. Bandung',
      roomName: 'ALAMANDA 4 - 4.2',
      roomClass: 'JUNIOR SUITE',
      allergies: 'Coklat',
    },
    {
      rmNumber: 'RM-55555',
      name: 'Rina Kusuma',
      dob: new Date('2000-03-12T00:00:00Z'),
      phone: '085555555555',
      address: 'Kavling Buah Batu Square Blok F No. 19, Cipagalo, Bojongsoang',
      roomName: 'TULIP 1 - 1.3',
      roomClass: 'VIP D',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-66666',
      name: 'Agus Gunawan',
      dob: new Date('1965-11-25T00:00:00Z'),
      phone: '086666666666',
      address: 'Pondok Hijau Permai Sektor V Blok E3 No. 7, Ciwaruga, Bandung Barat',
      roomName: 'TULIP 5 - 5.1',
      roomClass: 'VIP D',
      allergies: 'Udang',
    },
    {
      rmNumber: 'RM-99998',
      name: 'Budi Test',
      dob: new Date('1990-01-01T00:00:00Z'),
      phone: '08123456789',
      address: 'Jl. Raya Cibiru No. 123, Bandung',
      roomName: 'TULIP 1 - 1.3',
      roomClass: 'VIP D',
      allergies: 'Tidak Ada',
    },
    {
      rmNumber: 'RM-99999',
      name: 'Budi Test',
      dob: new Date('1990-01-01T00:00:00Z'),
      phone: '08123456790',
      address: 'Jl. Setiabudi No. 45, Bandung',
      roomName: 'MAWAR 2 - 2.5',
      roomClass: 'Kelas 1',
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
        address: p.address,
        roomName: p.roomName,
        roomClass: p.roomClass,
        allergies: p.allergies,
      },
      create: p,
    });
    seededPatients[p.rmNumber] = patientRecord;
    console.log(`âœ… Seeded Patient: ${patientRecord.name} (${patientRecord.rmNumber}) - Kamar: ${patientRecord.roomName}`);
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
          karbohidrat: item.karbohidrat || null,
          protein: item.protein || null,
          nabati: item.nabati || null,
          proteinTambahan: item.proteinTambahan || null,
          sayur: item.sayur || null,
        })),
      });
      totalItemsSeeded += created.count;
    } else {
      console.log(`ðŸ“¦ [Siklus ${id}] ${description} -> (0 menu item / data kosong).`);
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
    // 2. Budi Santoso (VIP C / Kelas 1) [ðŸ”´ Alergi: Seafood, Udang]
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
    // 3. Siti Aminah (VIP B) [ðŸ”´ Alergi: Telur, Susu Sapi]
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
    // 4. Dewi Lestari (EDELWEISS SUITE 01) [ðŸ”´ Alergi: Kacang Tanah]
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
    // 7. Agus Gunawan (Kelas 3) [ðŸ”´ Alergi: Daging Ayam]
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

  console.log(`\nðŸ“‹ SEEDED ORDERS UNTUK 2 TANGGAL OPERASIONAL:`);
  console.log(`   ðŸ“… PENYAJIAN HARI INI (${formatLocal(dateToday)}) [SIKLUS 9 - Dipesan Kemarin ${formatLocal(dateYesterday)}]: ${todayOrders.length} item pesanan (7 Pasien)`);
  console.log(`   ðŸ“… PENYAJIAN BESOK / T+1 (${formatLocal(dateTomorrow)}) [SIKLUS 10 - Dipesan Hari Ini ${formatLocal(dateToday)}]: ${tomorrowOrders.length} item pesanan (7 Pasien)`);
  console.log(`   âœ¨ Termasuk variasi Kelas VIP A/B/C/Suite/Kelas 1-3, Pasien Alergi & Catatan Khusus.`);

  console.log(`\nðŸŽ‰ SEEDING SELESAI! Total ${MENU_CYCLES_DATA.length} Siklus, ${totalItemsSeeded} Menu Item, dan ${allOrdersToSeed.length} item pesanan berhasil disimpan.`);
}

main()
  .catch((e) => {
    console.error('âŒ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

