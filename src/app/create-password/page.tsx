import {
  LoginLayout,
} from "@/features/auth/components/login-layout";

import {
  LoginCard,
} from "@/features/auth/components/login-card";

import {
  CreatePasswordHeader,
} from "@/features/auth/components/create-password-header";

import {
  CreatePasswordForm,
} from "@/features/auth/components/create-password-form";

type Props = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CreatePasswordPage({
  searchParams,
}: Props) {

  const {
    email = "",
  } = await searchParams;

  return (

    <LoginLayout>

      <LoginCard
        header={<CreatePasswordHeader />}
      >

        <CreatePasswordForm
          email={email}
        />

      </LoginCard>

    </LoginLayout>

  );

}