import { useEffect, useState } from 'react';
import { getInitials, MemberItem } from '../data/klp48Data';

interface MemberAvatarProps {
  member: Pick<MemberItem, 'nama' | 'gambar'>;
  indexNumber: number;
  className?: string;
  imgClassName?: string;
  initialsClassName?: string;
  fallbackTone?: 'dark' | 'light';
  priority?: boolean;
}

export function MemberAvatar({
  member,
  indexNumber,
  className = '',
  imgClassName = '',
  initialsClassName = 'text-2xl',
  fallbackTone = 'dark',
  priority = false,
}: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [member.gambar]);

  const hue = 100 + ((indexNumber * 11) % 50);
  const hasImage = Boolean(member.gambar) && !failed;

  const fallbackStyle =
    fallbackTone === 'light'
      ? {
          background: `linear-gradient(160deg, hsl(${hue}, 45%, 88%), hsl(${
            (hue + 32) % 360
          }, 48%, 74%))`,
        }
      : {
          background: `linear-gradient(160deg, hsl(${hue}, 55%, 42%), hsl(${
            (hue + 40) % 360
          }, 60%, 24%))`,
        };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={hasImage ? undefined : fallbackStyle}
    >
      {hasImage ? (
        <img
          src={member.gambar}
          alt={member.nama}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover object-top ${imgClassName}`}
        />
      ) : (
        <div
          className={`font-display flex h-full w-full items-center justify-center font-extrabold tracking-tight ${
            fallbackTone === 'light' ? 'text-[#0b1608]/85' : 'text-white/95'
          } ${initialsClassName}`}
        >
          {getInitials(member.nama)}
        </div>
      )}
    </div>
  );
}
