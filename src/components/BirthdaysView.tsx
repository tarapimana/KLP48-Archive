import { useState } from 'react';
import { MemberItem, MEMBERS_DATA } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { BirthdayCountdown } from './BirthdayCountdown';
import { MemberModal } from './MemberModal';

interface BirthdaysViewProps {
  lang: Lang;
}

export function BirthdaysView({ lang }: BirthdaysViewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);

  const selectedIndex = selectedMember
    ? MEMBERS_DATA.findIndex((m) => m.nama === selectedMember.nama)
    : 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#131f10] sm:text-4xl dark:text-[#ecf4e8]">
          {t.n_bday}
        </h1>
        <p className="mt-1.5 text-sm text-[#52634c] sm:text-base dark:text-[#98ad90]">
          {t.bd_sub}
        </p>
      </header>

      <BirthdayCountdown
        lang={lang}
        showAll
        includeCalendar
        onSelectMember={(member) => setSelectedMember(member)}
      />

      <MemberModal
        member={selectedMember}
        indexNumber={selectedIndex >= 0 ? selectedIndex : 0}
        lang={lang}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
