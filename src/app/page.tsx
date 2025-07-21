import lgImage from '@/assets/bg.jpg';
import { LoginForm } from '@/components/LoginForm';
import Link from 'next/link';
import { FaCanadianMapleLeaf } from 'react-icons/fa6';
export default function Home() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-900">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-accent"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <FaCanadianMapleLeaf className="size-4" />
            </div>
            Mapel BPO
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={lgImage.src}
          alt="mage"
          className="absolute inset-0 h-full w-full object-cover object-center dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
