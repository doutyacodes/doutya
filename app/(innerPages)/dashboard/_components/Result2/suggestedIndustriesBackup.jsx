// BACKUP: Suggested Industries Implementation for Result2
// Saved on 2026-10-03
// This file preserves the previous suggested industries grid and fetchIndustry logic
// so it can be restored whenever requested.

/*
// 1. STATE & API FETCH LOGIC (from page.js):
const [industries, setIndustries] = useState([]);
const [fetchingIndustry, setFetchingIndustry] = useState(false);

const fetchIndustry = async () => {
  setFetchingIndustry(true);
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const data  = await GlobalApi.GetIndustry(token, language);
    setIndustries(JSON.parse(data.data.result));
  } catch (err) {
    console.error(err);
  } finally {
    setFetchingIndustry(false);
  }
};

// In fetchResults:
if (response.status === 204) {
  setStep(1);
  fetchIndustry();
}

// 2. STEP 1 HEADER (from page.js):
{step === 1 && industries.length > 0 && (
  <>
    <InterestTestComplete />
    <div className="relative mx-4 mb-6">
      <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-full"><Sparkles className="w-8 h-8 text-orange-400" /></div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">SELECT INDUSTRY</h1>
        </div>
        <div className="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-4" />
      </div>
    </div>
  </>
)}

// 3. STEP 1 FULL GRID WITH SUGGESTED INDUSTRIES (from page.js):
{step === 1 && industries.length > 0 && (
  <div className="p-6 rounded-lg text-white mt-6 w-full max-sm:pb-24">
    <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
      {showAlert && <AlertDialogue fetchResults={fetchResults} setShowAlert={setShowAlert} />}

      <div className={`sm:col-span-6 md:col-span-6 col-span-12 ${fetchingCareer ? "pointer-events-none opacity-50" : "cursor-pointer"}`} onClick={() => !fetchingCareer && setShowAlert(true)}>
        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-orange-500/50 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
              <Sparkles className="w-4 h-4" />{t("industryAgnostic")}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-gray-200 text-sm text-center leading-relaxed">Explore career suggestions across various industries</p>
          </div>
        </div>
      </div>

      <div className={`sm:col-span-6 md:col-span-6 col-span-12 ${fetchingCareer ? "pointer-events-none opacity-50" : "cursor-pointer"}`} onClick={() => !fetchingCareer && setShowDialogue(true)}>
        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-green-500/50 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
              <TrendingUp className="w-4 h-4" />{t("industrySpecific")}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-gray-200 text-sm text-center leading-relaxed">Enter your preferred industry to discover tailored career options</p>
          </div>
        </div>
        <AddIndustry isOpen={showDialogue} onClose={() => setShowDialogue(false)} fetchResults={fetchResults} />
      </div>

      <div className="col-span-12 text-center py-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
          {t("selectBelowIndustry")}
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto" />
      </div>

      {industries.map((industry, index) => {
        const color = getColorByIndex(index);
        return (
          <div
            key={index}
            className={`sm:col-span-6 md:col-span-4 col-span-6 ${fetchingCareer ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
            onClick={() => !fetchingCareer && fetchResults(industry.industry_name)}
          >
            <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: `${color}20` }}>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                <p className="text-gray-200 text-sm text-center font-medium leading-relaxed">{industry.industry_name}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
*/

export default function SuggestedIndustriesBackup() {
  return null;
}
