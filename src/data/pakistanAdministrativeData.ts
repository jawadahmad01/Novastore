/**
 * PAKISTAN ADMINISTRATIVE HIERARCHY DATASET
 * 
 * Sources: Pakistan Bureau of Statistics (PBS) 2023 Census & Official Provincial Gazette Notifications.
 * 
 * Full 4-Tier Hierarchy:
 * Country (Pakistan)
 *   ↓
 * Province / Region (7 Regions: Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, ICT, AJK, Gilgit-Baltistan)
 *   ↓
 * Division (39 Administrative Divisions)
 *   ↓
 * District (170+ Official Districts, including all merged tribal districts under KP)
 *   ↓
 * Tehsil / Taluka / Sub-Division (600+ Units)
 */

export interface TehsilItem {
  name: string;
  type?: "Tehsil" | "Taluka" | "Sub-Division";
}

export interface DistrictItem {
  name: string;
  tehsils: string[];
}

export interface DivisionItem {
  name: string;
  districts: DistrictItem[];
}

export interface ProvinceRegionItem {
  name: string;
  divisions: DivisionItem[];
}

export const PAKISTAN_ADMINISTRATIVE_DATA: ProvinceRegionItem[] = [
  // ==========================================================================
  // 1. PUNJAB
  // ==========================================================================
  {
    name: "Punjab",
    divisions: [
      {
        name: "Bahawalpur Division",
        districts: [
          {
            name: "Bahawalpur",
            tehsils: [
              "Bahawalpur City",
              "Bahawalpur Saddar",
              "Ahmadpur East",
              "Hasilpur",
              "Khairpur Tamewali",
              "Yazman",
            ],
          },
          {
            name: "Bahawalnagar",
            tehsils: [
              "Bahawalnagar",
              "Chishtian",
              "Fort Abbas",
              "Haroonabad",
              "Minchinabad",
            ],
          },
          {
            name: "Rahim Yar Khan",
            tehsils: [
              "Rahim Yar Khan",
              "Khanpur",
              "Liaqatpur",
              "Sadiqabad",
            ],
          },
        ],
      },
      {
        name: "Dera Ghazi Khan Division",
        districts: [
          {
            name: "Dera Ghazi Khan",
            tehsils: [
              "Dera Ghazi Khan",
              "Kot Chutta",
              "De-Excluded Area D.G. Khan",
            ],
          },
          {
            name: "Layyah",
            tehsils: [
              "Layyah",
              "Chaubara",
              "Karor Lal Esan",
              "Fatehpur",
            ],
          },
          {
            name: "Muzaffargarh",
            tehsils: [
              "Muzaffargarh",
              "Alipur",
              "Jatoi",
              "Khangarh",
              "Rohillanwali",
            ],
          },
          {
            name: "Kot Addu",
            tehsils: [
              "Kot Addu",
              "Chowk Sarwar Shaheed",
            ],
          },
          {
            name: "Rajanpur",
            tehsils: [
              "Rajanpur",
              "Jampur",
              "Rojhan",
              "De-Excluded Area Rajanpur",
              "Fazilpur",
            ],
          },
          {
            name: "Taunsa",
            tehsils: [
              "Taunsa",
              "Koh-e-Suleman",
              "Vehova",
            ],
          },
        ],
      },
      {
        name: "Faisalabad Division",
        districts: [
          {
            name: "Faisalabad",
            tehsils: [
              "Faisalabad City",
              "Faisalabad Saddar",
              "Chak Jhumra",
              "Jaranwala",
              "Samundri",
              "Tandlianwala",
              "Iqbal Town",
            ],
          },
          {
            name: "Chiniot",
            tehsils: [
              "Chiniot",
              "Bhawana",
              "Lalian",
            ],
          },
          {
            name: "Jhang",
            tehsils: [
              "Jhang",
              "18-Hazari",
              "Ahmadpur Sial",
              "Shorkot",
              "Mandi Shah Jeewna",
            ],
          },
          {
            name: "Toba Tek Singh",
            tehsils: [
              "Toba Tek Singh",
              "Gojra",
              "Kamalia",
              "Pir Mahal",
            ],
          },
        ],
      },
      {
        name: "Gujranwala Division",
        districts: [
          {
            name: "Gujranwala",
            tehsils: [
              "Gujranwala City",
              "Gujranwala Saddar",
              "Kamoke",
              "Nowshera Virkan",
              "Qila Didar Singh",
            ],
          },
          {
            name: "Narowal",
            tehsils: [
              "Narowal",
              "Shakargarh",
              "Zafarwal",
            ],
          },
          {
            name: "Sialkot",
            tehsils: [
              "Sialkot",
              "Daska",
              "Pasrur",
              "Sambrial",
            ],
          },
        ],
      },
      {
        name: "Gujarat Division",
        districts: [
          {
            name: "Gujarat",
            tehsils: [
              "Gujarat",
              "Kharian",
              "Sarai Alamgir",
              "Jalalpur Jattan",
              "Kunjah",
            ],
          },
          {
            name: "Hafizabad",
            tehsils: [
              "Hafizabad",
              "Pindi Bhattian",
            ],
          },
          {
            name: "Mandi Bahauddin",
            tehsils: [
              "Mandi Bahauddin",
              "Malakwal",
              "Phalia",
            ],
          },
          {
            name: "Wazirabad",
            tehsils: [
              "Wazirabad",
              "Ali Pur Chatta",
            ],
          },
        ],
      },
      {
        name: "Lahore Division",
        districts: [
          {
            name: "Lahore",
            tehsils: [
              "Lahore City",
              "Lahore Cantt",
              "Model Town",
              "Raiwind",
              "Shalimar",
              "Allama Iqbal Town",
              "Nishtar Town",
              "Gulberg",
              "Wagah",
            ],
          },
          {
            name: "Kasur",
            tehsils: [
              "Kasur",
              "Chunian",
              "Kot Radha Kishan",
              "Pattoki",
            ],
          },
          {
            name: "Nankana Sahib",
            tehsils: [
              "Nankana Sahib",
              "Sangla Hill",
              "Shah Kot",
            ],
          },
          {
            name: "Sheikhupura",
            tehsils: [
              "Sheikhupura",
              "Ferozewala",
              "Muridke",
              "Safdarabad",
              "Sharaqpur",
            ],
          },
        ],
      },
      {
        name: "Multan Division",
        districts: [
          {
            name: "Multan",
            tehsils: [
              "Multan City",
              "Multan Saddar",
              "Jalalpur Pirwala",
              "Shujabad",
            ],
          },
          {
            name: "Khanewal",
            tehsils: [
              "Khanewal",
              "Jahanian",
              "Kabirwala",
              "Mian Channu",
            ],
          },
          {
            name: "Lodhran",
            tehsils: [
              "Lodhran",
              "Dunyapur",
              "Kahror Pacca",
            ],
          },
          {
            name: "Vehari",
            tehsils: [
              "Vehari",
              "Burewala",
              "Mailsi",
            ],
          },
        ],
      },
      {
        name: "Rawalpindi Division",
        districts: [
          {
            name: "Rawalpindi",
            tehsils: [
              "Rawalpindi",
              "Gujar Khan",
              "Kahuta",
              "Kallar Syedan",
              "Taxila",
              "Rawalpindi Cantt",
            ],
          },
          {
            name: "Murree",
            tehsils: [
              "Murree",
              "Kotli Sattian",
            ],
          },
          {
            name: "Attock",
            tehsils: [
              "Attock",
              "Fateh Jang",
              "Hassan Abdal",
              "Hazro",
              "Jand",
              "Pindi Gheb",
            ],
          },
          {
            name: "Chakwal",
            tehsils: [
              "Chakwal",
              "Choa Saidan Shah",
              "Kallar Kahar",
            ],
          },
          {
            name: "Talagang",
            tehsils: [
              "Talagang",
              "Lawa",
              "Multan Khurd",
            ],
          },
          {
            name: "Jhelum",
            tehsils: [
              "Jhelum",
              "Dina",
              "Pind Dadan Khan",
              "Sohawa",
            ],
          },
        ],
      },
      {
        name: "Sahiwal Division",
        districts: [
          {
            name: "Sahiwal",
            tehsils: [
              "Sahiwal",
              "Chichawatni",
            ],
          },
          {
            name: "Okara",
            tehsils: [
              "Okara",
              "Depalpur",
              "Renala Khurd",
            ],
          },
          {
            name: "Pakpattan",
            tehsils: [
              "Pakpattan",
              "Arifwala",
            ],
          },
        ],
      },
      {
        name: "Sargodha Division",
        districts: [
          {
            name: "Sargodha",
            tehsils: [
              "Sargodha",
              "Bhalwal",
              "Bhera",
              "Kot Momin",
              "Sahiwal (Sargodha)",
              "Shahpur",
              "Sillanwali",
            ],
          },
          {
            name: "Bhakkar",
            tehsils: [
              "Bhakkar",
              "Darya Khan",
              "Kallurkot",
              "Mankera",
            ],
          },
          {
            name: "Khushab",
            tehsils: [
              "Khushab",
              "Noorpur Thal",
              "Quaidabad",
              "Naushera (Wadha)",
            ],
          },
          {
            name: "Mianwali",
            tehsils: [
              "Mianwali",
              "Isakhel",
              "Piplan",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 2. SINDH
  // ==========================================================================
  {
    name: "Sindh",
    divisions: [
      {
        name: "Banbhore Division",
        districts: [
          {
            name: "Thatta",
            tehsils: [
              "Thatta Taluka",
              "Mirpur Sakro Taluka",
              "Ghorabari Taluka",
              "Keti Bunder Taluka",
            ],
          },
          {
            name: "Sujawal",
            tehsils: [
              "Sujawal Taluka",
              "Jati Taluka",
              "Mirpur Bathoro Taluka",
              "Shah Bunder Taluka",
              "Kharo Chan Taluka",
            ],
          },
          {
            name: "Badin",
            tehsils: [
              "Badin Taluka",
              "Matli Taluka",
              "Shaheed Fazil Rahu (Golarchi)",
              "Talhar Taluka",
              "Tando Bago Taluka",
            ],
          },
        ],
      },
      {
        name: "Hyderabad Division",
        districts: [
          {
            name: "Hyderabad",
            tehsils: [
              "Hyderabad City Taluka",
              "Hyderabad Latifabad Taluka",
              "Hyderabad Qasimabad Taluka",
              "Hyderabad Rural Taluka",
            ],
          },
          {
            name: "Dadu",
            tehsils: [
              "Dadu Taluka",
              "Johi Taluka",
              "Khairpur Nathan Shah Taluka",
              "Mehar Taluka",
            ],
          },
          {
            name: "Jamshoro",
            tehsils: [
              "Kotri Taluka",
              "Sehwan Taluka",
              "Manjhand Taluka",
              "Thana Bula Khan Taluka",
            ],
          },
          {
            name: "Matiari",
            tehsils: [
              "Matiari Taluka",
              "Hala Taluka",
              "Saeedabad Taluka",
            ],
          },
          {
            name: "Tando Allahyar",
            tehsils: [
              "Tando Allahyar Taluka",
              "Chamber Taluka",
              "Jhando Mari Taluka",
            ],
          },
          {
            name: "Tando Muhammad Khan",
            tehsils: [
              "Tando Muhammad Khan Taluka",
              "Bulri Shah Karim Taluka",
              "Tando Ghulam Hyder Taluka",
            ],
          },
        ],
      },
      {
        name: "Karachi Division",
        districts: [
          {
            name: "Karachi Central",
            tehsils: [
              "Gulberg Sub-Division",
              "Liaquatabad Sub-Division",
              "Nazimabad Sub-Division",
              "New Karachi Sub-Division",
              "North Nazimabad Sub-Division",
            ],
          },
          {
            name: "Karachi East",
            tehsils: [
              "Ferozabad Sub-Division",
              "Gulshan-e-Iqbal Sub-Division",
              "Gulzar-e-Hijri (Scheme 33) Sub-Division",
              "Jamshed Quarters Sub-Division",
            ],
          },
          {
            name: "Karachi South",
            tehsils: [
              "Aram Bagh Sub-Division",
              "Civil Line Sub-Division",
              "Garden Sub-Division",
              "Lyari Sub-Division",
              "Saddar Sub-Division",
            ],
          },
          {
            name: "Karachi West",
            tehsils: [
              "Manghopir Sub-Division",
              "Mominabad Sub-Division",
              "Orangi Sub-Division",
              "SITE Sub-Division",
            ],
          },
          {
            name: "Korangi",
            tehsils: [
              "Korangi Sub-Division",
              "Landhi Sub-Division",
              "Model Colony Sub-Division",
              "Shah Faisal Sub-Division",
            ],
          },
          {
            name: "Malir",
            tehsils: [
              "Airport Sub-Division",
              "Bin Qasim Sub-Division",
              "Gadap Sub-Division",
              "Ibrahim Hyderi Sub-Division",
              "Murad Memon Sub-Division",
              "Shah Murad Sub-Division",
            ],
          },
          {
            name: "Keamari",
            tehsils: [
              "Baldia Sub-Division",
              "Harbour Sub-Division",
              "Keamari Sub-Division",
              "Mauripur Sub-Division",
            ],
          },
        ],
      },
      {
        name: "Larkana Division",
        districts: [
          {
            name: "Larkana",
            tehsils: [
              "Larkana Taluka",
              "Bakrani Taluka",
              "Dokri Taluka",
              "Ratodero Taluka",
            ],
          },
          {
            name: "Jacobabad",
            tehsils: [
              "Jacobabad Taluka",
              "Garhi Khairo Taluka",
              "Thul Taluka",
            ],
          },
          {
            name: "Kashmore",
            tehsils: [
              "Kashmore Taluka",
              "Kandhkot Taluka",
              "Tangwani Taluka",
            ],
          },
          {
            name: "Qambar Shahdadkot",
            tehsils: [
              "Qambar Taluka",
              "Shahdadkot Taluka",
              "Mirokhan Taluka",
              "Nasirabad Taluka",
              "Qubo Saeed Khan Taluka",
              "Sijawal Junejo Taluka",
              "Warah Taluka",
            ],
          },
          {
            name: "Shikarpur",
            tehsils: [
              "Shikarpur Taluka",
              "Garhi Yasin Taluka",
              "Khanpur Taluka",
              "Lakhi Taluka",
            ],
          },
        ],
      },
      {
        name: "Mirpur Khas Division",
        districts: [
          {
            name: "Mirpur Khas",
            tehsils: [
              "Mirpur Khas Taluka",
              "Digri Taluka",
              "Hussain Bux Mari Taluka",
              "Jhuddo Taluka",
              "Kot Ghulam Muhammad Taluka",
              "Shujabad Taluka",
              "Sindhri Taluka",
            ],
          },
          {
            name: "Tharparkar",
            tehsils: [
              "Mithi Taluka",
              "Chachro Taluka",
              "Dahli Taluka",
              "Diplo Taluka",
              "Islamkot Taluka",
              "Kaloi Taluka",
              "Nagarparkar Taluka",
            ],
          },
          {
            name: "Umerkot",
            tehsils: [
              "Umerkot Taluka",
              "Kunri Taluka",
              "Pithoro Taluka",
              "Samaro Taluka",
            ],
          },
        ],
      },
      {
        name: "Shaheed Benazirabad Division",
        districts: [
          {
            name: "Shaheed Benazirabad (Nawabshah)",
            tehsils: [
              "Nawabshah Taluka",
              "Daur Taluka",
              "Kazi Ahmed Taluka",
              "Sakrand Taluka",
            ],
          },
          {
            name: "Naushahro Feroze",
            tehsils: [
              "Naushahro Feroze Taluka",
              "Bhiria Taluka",
              "Kandiaro Taluka",
              "Mehrabpur Taluka",
              "Moro Taluka",
            ],
          },
          {
            name: "Sanghar",
            tehsils: [
              "Sanghar Taluka",
              "Jam Nawaz Ali Taluka",
              "Khipro Taluka",
              "Shahdadpur Taluka",
              "Sinjhoro Taluka",
              "Tando Adam Taluka",
            ],
          },
        ],
      },
      {
        name: "Sukkur Division",
        districts: [
          {
            name: "Sukkur",
            tehsils: [
              "Sukkur City Taluka",
              "New Sukkur Taluka",
              "Rohri Taluka",
              "Pano Akil Taluka",
              "Salehpat Taluka",
            ],
          },
          {
            name: "Ghotki",
            tehsils: [
              "Ghotki Taluka",
              "Daharki Taluka",
              "Khangarh (Khanpur Mahar) Taluka",
              "Mirpur Mathelo Taluka",
              "Ubauro Taluka",
            ],
          },
          {
            name: "Khairpur",
            tehsils: [
              "Khairpur Taluka",
              "Faiz Ganj Taluka",
              "Gambat Taluka",
              "Kingri Taluka",
              "Kot Diji Taluka",
              "Nara Taluka",
              "Sobhodero Taluka",
              "Thari Mirwah Taluka",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 3. KHYBER PAKHTUNKHWA (Includes merged tribal districts)
  // ==========================================================================
  {
    name: "Khyber Pakhtunkhwa",
    divisions: [
      {
        name: "Bannu Division",
        districts: [
          {
            name: "Bannu",
            tehsils: [
              "Bannu",
              "Domel",
              "Baka Khel",
              "Kakki",
              "Miryan",
              "Wazir",
            ],
          },
          {
            name: "Lakki Marwat",
            tehsils: [
              "Lakki Marwat",
              "Naurang",
              "Betani",
              "Ghazni Khel",
              "Sari Naurang",
            ],
          },
          {
            name: "North Waziristan",
            tehsils: [
              "Miran Shah",
              "Mir Ali",
              "Datta Khel",
              "Dossali",
              "Ghulam Khan",
              "Garyum",
              "Razmak",
              "Shewa",
              "Spinwam",
            ],
          },
        ],
      },
      {
        name: "Dera Ismail Khan Division",
        districts: [
          {
            name: "Dera Ismail Khan",
            tehsils: [
              "Dera Ismail Khan",
              "Daraban",
              "Darazinda",
              "Kulachi",
              "Paharpur",
              "Paroa",
              "Paniala",
            ],
          },
          {
            name: "Tank",
            tehsils: [
              "Tank",
              "Amankhel",
              "Jandola",
              "Ping",
            ],
          },
          {
            name: "South Waziristan Upper",
            tehsils: [
              "Ladha",
              "Makin",
              "Sararogha",
              "Sarwakai",
              "Shaktoi",
              "Shawal",
              "Tiarza",
            ],
          },
          {
            name: "South Waziristan Lower",
            tehsils: [
              "Wana",
              "Birmil",
              "Shakai",
              "Toi Khulla",
            ],
          },
        ],
      },
      {
        name: "Hazara Division",
        districts: [
          {
            name: "Abbottabad",
            tehsils: [
              "Abbottabad",
              "Havelian",
              "Lora",
              "Lower Tanawal",
            ],
          },
          {
            name: "Haripur",
            tehsils: [
              "Haripur",
              "Ghazi",
              "Khanpur",
            ],
          },
          {
            name: "Mansehra",
            tehsils: [
              "Mansehra",
              "Balakot",
              "Baffa Pakhal",
              "Darband",
              "Oghi",
              "Judba",
            ],
          },
          {
            name: "Battagram",
            tehsils: [
              "Battagram",
              "Allai",
            ],
          },
          {
            name: "Torghar",
            tehsils: [
              "Judba",
              "Khander",
              "Dor Maira",
              "Hassanzai",
            ],
          },
          {
            name: "Upper Kohistan",
            tehsils: [
              "Dasu",
              "Kandia",
              "Seo",
              "Harban Basha",
            ],
          },
          {
            name: "Lower Kohistan",
            tehsils: [
              "Pattan",
              "Bankad",
            ],
          },
          {
            name: "Kolai-Palas",
            tehsils: [
              "Kolai",
              "Palas",
              "Battera",
            ],
          },
        ],
      },
      {
        name: "Kohat Division",
        districts: [
          {
            name: "Kohat",
            tehsils: [
              "Kohat",
              "Gumbat",
              "Lachi",
              "Dara Adam Khel",
            ],
          },
          {
            name: "Hangu",
            tehsils: [
              "Hangu",
              "Doaba",
              "Thall",
            ],
          },
          {
            name: "Karak",
            tehsils: [
              "Karak",
              "Banda Daud Shah",
              "Takht-e-Nasrati",
            ],
          },
          {
            name: "Kurram",
            tehsils: [
              "Upper Kurram",
              "Lower Kurram",
              "Central Kurram",
            ],
          },
          {
            name: "Orakzai",
            tehsils: [
              "Upper Orakzai",
              "Lower Orakzai",
              "Central Orakzai",
              "Ismail Zai",
            ],
          },
        ],
      },
      {
        name: "Malakand Division",
        districts: [
          {
            name: "Swat",
            tehsils: [
              "Babuzai (Mingora)",
              "Barikot",
              "Charbagh",
              "Kabal",
              "Khwaza Khela",
              "Matta",
              "Bahrain",
            ],
          },
          {
            name: "Lower Dir",
            tehsils: [
              "Timergara",
              "Balambat",
              "Lal Qilla",
              "Samar Bagh",
              "Adenzai",
              "Munda",
              "Khall",
            ],
          },
          {
            name: "Upper Dir",
            tehsils: [
              "Dir",
              "Barawal",
              "Kalkot",
              "Lar Jam",
              "Sharingal",
              "Wari",
            ],
          },
          {
            name: "Chitral Lower",
            tehsils: [
              "Chitral",
              "Drosh",
              "Ayun",
              "Lotkoh",
            ],
          },
          {
            name: "Chitral Upper",
            tehsils: [
              "Mastuj",
              "Mulkhow",
              "Torkhow",
              "Buni",
            ],
          },
          {
            name: "Buner",
            tehsils: [
              "Daggar",
              "Gadezai",
              "Gagra",
              "Khudu Khel",
              "Mandanr",
              "Chagharzai",
            ],
          },
          {
            name: "Shangla",
            tehsils: [
              "Alpuri",
              "Besham",
              "Chakesar",
              "Martung",
              "Makhuzai",
              "Puran",
            ],
          },
          {
            name: "Malakand",
            tehsils: [
              "Batkhela",
              "Dargai",
              "Sam Ranizai",
              "Baizai",
            ],
          },
          {
            name: "Bajaur",
            tehsils: [
              "Khar Bajaur",
              "Barang",
              "Nawagai",
              "Mamund",
              "Salarzai",
              "Utmankhel",
              "Chamarkand",
            ],
          },
        ],
      },
      {
        name: "Mardan Division",
        districts: [
          {
            name: "Mardan",
            tehsils: [
              "Mardan",
              "Katlang",
              "Rustam",
              "Takht Bhai",
              "Garhi Kapura",
            ],
          },
          {
            name: "Swabi",
            tehsils: [
              "Swabi",
              "Chota Lahor",
              "Razzar",
              "Topi",
            ],
          },
        ],
      },
      {
        name: "Peshawar Division",
        districts: [
          {
            name: "Peshawar",
            tehsils: [
              "Peshawar City",
              "Shah Alam",
              "Saddar",
              "Badhber",
              "Chamkani",
              "Hassan Khel",
              "Mathra",
            ],
          },
          {
            name: "Charsadda",
            tehsils: [
              "Charsadda",
              "Shabqadar",
              "Tangi",
            ],
          },
          {
            name: "Nowshera",
            tehsils: [
              "Nowshera",
              "Pabbi",
              "Jehangira",
            ],
          },
          {
            name: "Khyber",
            tehsils: [
              "Bara",
              "Jamrud",
              "Landi Kotal",
              "Mula Gori",
            ],
          },
          {
            name: "Mohmand",
            tehsils: [
              "Halimzai",
              "Pandyali",
              "Prang Ghar",
              "Safi",
              "Upper Mohmand",
              "Yake Ghund",
              "Ambar",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 4. BALOCHISTAN
  // ==========================================================================
  {
    name: "Balochistan",
    divisions: [
      {
        name: "Kalat Division",
        districts: [
          {
            name: "Kalat",
            tehsils: [
              "Kalat",
              "Manguchar",
              "Johan",
              "Gazg",
            ],
          },
          {
            name: "Surab",
            tehsils: [
              "Surab",
              "Gidar",
              "Shahi",
            ],
          },
          {
            name: "Khuzdar",
            tehsils: [
              "Khuzdar",
              "Baghbana",
              "Karakh",
              "Moola",
              "Nal",
              "Ornach",
              "Saroona",
              "Wadh",
              "Zehri",
            ],
          },
          {
            name: "Mastung",
            tehsils: [
              "Mastung",
              "Dasht",
              "Khad Kocha",
              "Kardigap",
            ],
          },
          {
            name: "Awaran",
            tehsils: [
              "Awaran",
              "Gishkaur",
              "Jhal Jhao",
              "Korak Jahoo",
              "Mashkay",
            ],
          },
          {
            name: "Hub",
            tehsils: [
              "Hub",
              "Dureji",
              "Gadani",
              "Sonmiani (Winder)",
              "Sakran",
            ],
          },
          {
            name: "Lasbela",
            tehsils: [
              "Bela",
              "Kanraj",
              "Lakhra",
              "Liari",
              "Uthal",
            ],
          },
        ],
      },
      {
        name: "Makran Division",
        districts: [
          {
            name: "Gwadar",
            tehsils: [
              "Gwadar",
              "Jiwani",
              "Ormara",
              "Pasni",
              "Suntsar",
            ],
          },
          {
            name: "Kech (Turbat)",
            tehsils: [
              "Turbat",
              "Buleda",
              "Dasht",
              "Mand",
              "Tump",
              "Zamuran",
              "Balnigor",
              "Hoshab",
            ],
          },
          {
            name: "Panjgur",
            tehsils: [
              "Panjgur",
              "Gowargo",
              "Gichk",
              "Paroom",
            ],
          },
        ],
      },
      {
        name: "Nasirabad Division",
        districts: [
          {
            name: "Nasirabad",
            tehsils: [
              "Dera Murad Jamali",
              "Chattar",
              "Baba Kot",
              "Tamboo",
            ],
          },
          {
            name: "Jaffarabad",
            tehsils: [
              "Dera Allah Yar",
              "Jhatpat",
            ],
          },
          {
            name: "Usta Muhammad",
            tehsils: [
              "Usta Muhammad",
              "Gandakha",
            ],
          },
          {
            name: "Jhal Magsi",
            tehsils: [
              "Jhal Magsi",
              "Gandawa",
              "Mirpur",
            ],
          },
          {
            name: "Kachhi (Bolan)",
            tehsils: [
              "Dhadar",
              "Bhag",
              "Mach",
              "Sani",
              "Khattan",
            ],
          },
          {
            name: "Sohbatpur",
            tehsils: [
              "Sohbatpur",
              "Faridabad",
              "Hayalo",
              "Manjhipur",
            ],
          },
        ],
      },
      {
        name: "Quetta Division",
        districts: [
          {
            name: "Quetta",
            tehsils: [
              "Quetta City",
              "Quetta Saddar",
              "Chiltan",
              "Zarghoon",
              "Panjpai",
            ],
          },
          {
            name: "Chaman",
            tehsils: [
              "Chaman",
              "Saddar Chaman",
            ],
          },
          {
            name: "Pishin",
            tehsils: [
              "Pishin",
              "Barshore",
              "Hurramzai",
              "Bostan",
              "Saranan",
            ],
          },
          {
            name: "Killa Abdullah",
            tehsils: [
              "Dobandi",
              "Gulistan",
              "Killa Abdullah",
            ],
          },
          {
            name: "Karezat",
            tehsils: [
              "Karezat",
              "Bostan Sub-Tehsil",
            ],
          },
        ],
      },
      {
        name: "Sibi Division",
        districts: [
          {
            name: "Sibi",
            tehsils: [
              "Sibi",
              "Kutmandai",
              "Sangan",
            ],
          },
          {
            name: "Dera Bugti",
            tehsils: [
              "Dera Bugti",
              "Phelan Bugti",
              "Sui",
              "Baiker",
            ],
          },
          {
            name: "Kohlu",
            tehsils: [
              "Kohlu",
              "Grisani",
              "Kahan",
              "Maiwand",
              "Tamboo",
            ],
          },
          {
            name: "Ziarat",
            tehsils: [
              "Ziarat",
              "Sinjawi",
            ],
          },
          {
            name: "Harnai",
            tehsils: [
              "Harnai",
              "Shahrig",
              "Khoast",
            ],
          },
        ],
      },
      {
        name: "Zhob Division",
        districts: [
          {
            name: "Zhob",
            tehsils: [
              "Zhob",
              "Ashwat",
              "Qamar Din Karez",
              "Sambaza",
            ],
          },
          {
            name: "Killa Saifullah",
            tehsils: [
              "Killa Saifullah",
              "Muslim Bagh",
              "Loiband",
              "Badini",
              "Kanmetharzai",
            ],
          },
          {
            name: "Sherani",
            tehsils: [
              "Sherani",
              "Qamar Din",
            ],
          },
        ],
      },
      {
        name: "Rakhshan Division",
        districts: [
          {
            name: "Chagai",
            tehsils: [
              "Dalbandin",
              "Nok Kundi",
              "Taftan",
              "Chagai",
            ],
          },
          {
            name: "Nushki",
            tehsils: [
              "Nushki",
              "Dak",
            ],
          },
          {
            name: "Kharan",
            tehsils: [
              "Kharan",
              "Sar-Kharan",
              "Tohumulk",
            ],
          },
          {
            name: "Washuk",
            tehsils: [
              "Washuk",
              "Besima",
              "Mashkel",
              "Nag",
              "Shahgori",
            ],
          },
        ],
      },
      {
        name: "Loralai Division",
        districts: [
          {
            name: "Loralai",
            tehsils: [
              "Loralai",
              "Bori",
              "Mekhtar",
            ],
          },
          {
            name: "Barkhan",
            tehsils: [
              "Barkhan",
            ],
          },
          {
            name: "Musakhel",
            tehsils: [
              "Musakhel",
              "Drug",
              "Kingri",
              "Toisar",
            ],
          },
          {
            name: "Duki",
            tehsils: [
              "Duki",
              "Thal Chotiali",
              "Payao",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 5. ISLAMABAD CAPITAL TERRITORY
  // ==========================================================================
  {
    name: "Islamabad Capital Territory",
    divisions: [
      {
        name: "Islamabad Division",
        districts: [
          {
            name: "Islamabad",
            tehsils: [
              "Islamabad Sub-Division",
              "Nilore Sub-Division",
              "Bhara Kahu Sub-Division",
              "Sihala Sub-Division",
              "Tarnol Sub-Division",
              "Rawat Sub-Division",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 6. AZAD JAMMU & KASHMIR
  // ==========================================================================
  {
    name: "Azad Jammu & Kashmir",
    divisions: [
      {
        name: "Muzaffarabad Division",
        districts: [
          {
            name: "Muzaffarabad",
            tehsils: [
              "Muzaffarabad",
              "Naseerabad (Patehka)",
            ],
          },
          {
            name: "Hattian Bala (Jhelum Valley)",
            tehsils: [
              "Hattian Bala",
              "Chikkar",
              "Leepa",
            ],
          },
          {
            name: "Neelum",
            tehsils: [
              "Athmuqam",
              "Sharda",
              "Kel",
            ],
          },
        ],
      },
      {
        name: "Mirpur Division",
        districts: [
          {
            name: "Mirpur",
            tehsils: [
              "Mirpur",
              "Dadyal",
              "Islamgarh",
            ],
          },
          {
            name: "Bhimber",
            tehsils: [
              "Bhimber",
              "Barnala",
              "Samahni",
            ],
          },
          {
            name: "Kotli",
            tehsils: [
              "Kotli",
              "Charhoi",
              "Fatehpur Thakiala (Nakyal)",
              "Khuiratta",
              "Sehnsa",
              "Duliah Jattan",
            ],
          },
        ],
      },
      {
        name: "Poonch Division",
        districts: [
          {
            name: "Poonch (Rawalakot)",
            tehsils: [
              "Rawalakot",
              "Hajira",
              "Abbaspur",
              "Thorar",
            ],
          },
          {
            name: "Bagh",
            tehsils: [
              "Bagh",
              "Dhirkot",
              "Hari Ghel",
              "Rera",
            ],
          },
          {
            name: "Haveli",
            tehsils: [
              "Forward Kahuta",
              "Khurshidabad",
              "Mumtazabad",
            ],
          },
          {
            name: "Sudhanoti (Pallandri)",
            tehsils: [
              "Pallandri",
              "Baloch",
              "Mang",
              "Trarkhel",
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // 7. GILGIT-BALTISTAN
  // ==========================================================================
  {
    name: "Gilgit-Baltistan",
    divisions: [
      {
        name: "Gilgit Division",
        districts: [
          {
            name: "Gilgit",
            tehsils: [
              "Gilgit",
              "Danyore",
              "Juglot",
              "Bagrote",
            ],
          },
          {
            name: "Hunza",
            tehsils: [
              "Aliabad",
              "Gojal",
              "Shinaki",
            ],
          },
          {
            name: "Nagar",
            tehsils: [
              "Nagar-I",
              "Nagar-II",
            ],
          },
          {
            name: "Ghizer",
            tehsils: [
              "Punial",
              "Ishkoman",
            ],
          },
          {
            name: "Gupis-Yasin",
            tehsils: [
              "Gupis",
              "Yasin",
              "Phander",
            ],
          },
        ],
      },
      {
        name: "Baltistan Division",
        districts: [
          {
            name: "Skardu",
            tehsils: [
              "Skardu",
              "Gultari",
              "Gamba",
            ],
          },
          {
            name: "Shigar",
            tehsils: [
              "Shigar",
              "Gulabpur",
            ],
          },
          {
            name: "Kharmang",
            tehsils: [
              "Kharmang",
              "Tolti",
            ],
          },
          {
            name: "Ghanche",
            tehsils: [
              "Khaplu",
              "Daghoni",
              "Mashabrum",
              "Chorbat",
            ],
          },
          {
            name: "Roundu",
            tehsils: [
              "Roundu",
              "Dambudas",
            ],
          },
        ],
      },
      {
        name: "Diamer Division",
        districts: [
          {
            name: "Diamer",
            tehsils: [
              "Chilas",
              "Babusar",
              "Bonar Das",
            ],
          },
          {
            name: "Astore",
            tehsils: [
              "Eidghah",
              "Gorikot",
              "Shounter",
            ],
          },
          {
            name: "Darel",
            tehsils: [
              "Darel",
            ],
          },
          {
            name: "Tangir",
            tehsils: [
              "Tangir",
            ],
          },
        ],
      },
    ],
  },
];

// ============================================================================
// HELPER QUERY FUNCTIONS FOR FAST HIERARCHY ACCESS
// ============================================================================

/**
 * Returns all 7 Pakistan provinces/regions
 */
export const getProvinces = (): string[] => {
  return PAKISTAN_ADMINISTRATIVE_DATA.map((p) => p.name);
};

/**
 * Returns divisions belonging to a specific province
 */
export const getDivisionsByProvince = (provinceName: string): string[] => {
  const prov = PAKISTAN_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === (provinceName || "").toLowerCase().trim()
  );
  return prov ? prov.divisions.map((d) => d.name) : [];
};

/**
 * Returns districts belonging to a specific division in a province
 */
export const getDistrictsByDivision = (
  provinceName: string,
  divisionName: string
): string[] => {
  const prov = PAKISTAN_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === (provinceName || "").toLowerCase().trim()
  );
  if (!prov) return [];

  const div = prov.divisions.find(
    (d) => d.name.toLowerCase() === (divisionName || "").toLowerCase().trim()
  );
  return div ? div.districts.map((dst) => dst.name) : [];
};

/**
 * Returns tehsils/talukas belonging to a specific district
 */
export const getTehsilsByDistrict = (
  provinceName: string,
  divisionName: string,
  districtName: string
): string[] => {
  const prov = PAKISTAN_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === (provinceName || "").toLowerCase().trim()
  );
  if (!prov) return [];

  const div = prov.divisions.find(
    (d) => d.name.toLowerCase() === (divisionName || "").toLowerCase().trim()
  );
  if (!div) return [];

  const dst = div.districts.find(
    (dist) => dist.name.toLowerCase() === (districtName || "").toLowerCase().trim()
  );
  return dst ? dst.tehsils : [];
};

/**
 * Validates whether a given combination of Province, Division, District, Tehsil is valid
 */
export const validateHierarchy = (
  province: string,
  division: string,
  district: string,
  tehsil?: string
): boolean => {
  const prov = PAKISTAN_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === (province || "").toLowerCase().trim()
  );
  if (!prov) return false;

  const div = prov.divisions.find(
    (d) => d.name.toLowerCase() === (division || "").toLowerCase().trim()
  );
  if (!div) return false;

  const dst = div.districts.find(
    (dist) => dist.name.toLowerCase() === (district || "").toLowerCase().trim()
  );
  if (!dst) return false;

  if (tehsil && tehsil.trim().length > 0) {
    return dst.tehsils.some(
      (t) => t.toLowerCase() === tehsil.toLowerCase().trim()
    );
  }

  return true;
};

/**
 * Returns diagnostic counts for verification
 */
export const getAdministrativeStats = () => {
  let divisionCount = 0;
  let districtCount = 0;
  let tehsilCount = 0;

  PAKISTAN_ADMINISTRATIVE_DATA.forEach((prov) => {
    prov.divisions.forEach((div) => {
      divisionCount += 1;
      div.districts.forEach((dst) => {
        districtCount += 1;
        tehsilCount += dst.tehsils.length;
      });
    });
  });

  return {
    provinceCount: PAKISTAN_ADMINISTRATIVE_DATA.length,
    divisionCount,
    districtCount,
    tehsilCount,
  };
};
