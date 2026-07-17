import React from "react";
import {
  Clock,
  UserCheck,
  CreditCard,
  Shield,
  Timer,
  Trophy,
  Zap,
  Users,
  BookOpen,
} from "lucide-react";

export const RulesSection: React.FC = () => {
  const regulations = [
    {
      title: "I. REGULASI KHUSUS TURNAMEN",
      description:
        "Setiap tim wajib memahami dan mematuhi regulasi khusus berikut demi kelancaran dan sportivitas turnamen:",
      items: [
        {
          title: "Keterlambatan & Walk Out (WO)",
          desc: "Batas waktu keterlambatan kehadiran tim di lapangan adalah 15 menit dari jadwal kick-off yang telah ditentukan. Jika dalam waktu 15 menit tim tidak hadir atau jumlah pemain kurang dari syarat minimal (3 orang), maka tim tersebut dinyatakan kalah Walk Out (WO) dengan skor 3 - 0.",
          icon: Clock,
        },
        {
          title: "Keabsahan Pemain",
          desc: "Pemain yang berhak bertanding HANYA pemain yang telah terdaftar resmi dalam formulir pendaftaran/Line-Up awal turnamen. TIDAK DIPERBOLEHKAN menggunakan pemain cabutan atau pemain luar yang tidak terdaftar. Jika ditemukan pelanggaran, tim akan didiskualifikasi dari turnamen.",
          icon: UserCheck,
        },
        {
          title: "Administrasi & Pendaftaran",
          desc: "Setiap tim wajib melunasi biaya pendaftaran sebesar Rp 200.000,- sebelum pertandingan dimulai. Tim hanya diperbolehkan bermain apabila administrasi pembayaran telah diselesaikan sepenuhnya.",
          icon: CreditCard,
        },
        {
          title: "Perlengkapan Wajib Pemain",
          desc: "Setiap pemain yang berada di dalam lapangan WAJIB menggunakan sepatu futsal/olahraga. Pemain yang tidak menggunakan perlengkapan lengkap tidak diizinkan masuk ke lapangan pertandingan.",
          icon: Shield,
        },
      ],
    },
    {
      title: "II. ATURAN UMUM PERTANDINGAN & FORMAT",
      description:
        "Format dan ketentuan teknis jalannya pertandingan di lapangan:",
      items: [
        {
          title: "Durasi Pertandingan",
          desc: "Waktu pertandingan dibagi menjadi dua format: Untuk Fase Grup berlangsung selama 2 x 10 menit, sedangkan untuk Fase Gugur (Knockout) berlangsung selama 2 x 15 menit. Waktu istirahat babak selama 5 menit.",
          icon: Timer,
        },
        {
          title: "Sistem & Kualifikasi Fase Grup",
          desc: "Pertandingan fase grup menggunakan sistem poin (menang 3, seri 1, kalah 0). Jika terdapat tim dengan poin yang sama, penentuan posisi klasemen akan dihitung berdasarkan selisih gol. Dari babak ini, hanya akan diambil 2 tim terbaik (Juara Grup dan Runner-up) dari masing-masing grup untuk lolos ke babak selanjutnya.",
          icon: Trophy,
        },
        {
          title: "Format Fase Gugur",
          desc: "Menggunakan sistem gugur. Apabila hasil pertandingan di fase gugur berakhir seri/imbang hingga waktu normal selesai, maka tidak ada perpanjangan waktu melainkan langsung dilanjutkan ke babak adu penalti (3 penendang utama).",
          icon: Zap,
        },
        {
          title: "Jumlah Pemain Minimum",
          desc: "Pertandingan tidak dapat dimulai atau dilanjutkan jika salah satu tim memiliki kurang dari 3 pemain di lapangan. Jika kartu merah menyebabkan jumlah pemain di bawah 3, pertandingan dihentikan dan kemenangan diberikan kepada lawan.",
          icon: Users,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Introduction Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 border border-emerald-500/20 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-zinc-100 text-base tracking-wide uppercase">
            Peraturan Turnamen
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Regulasi dan ketentuan resmi Turnamen Futsal Karang Taruna RW 03.
            Seluruh tim, pemain, dan ofisial wajib menaati poin-poin di bawah
            ini demi menjunjung tinggi sportivitas.
          </p>
        </div>
      </div>

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regulations.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="text-sm sm:text-base font-black text-emerald-450 uppercase tracking-wide">
                {group.title}
              </h3>
              <p className="text-zinc-500 text-[11px] sm:text-xs mt-0.5">
                {group.description}
              </p>
            </div>

            <div className="space-y-3">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    className="p-4 rounded-xl bg-zinc-900/25 border border-zinc-850/60 hover:border-zinc-800 transition-all duration-200 flex gap-3.5 items-start"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-emerald-450 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-200 text-sm tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-zinc-450 text-xs sm:text-[13px] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
