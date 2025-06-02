import { BellIcon, Link2Icon } from "@radix-ui/react-icons";
import { Callout, Container } from "@radix-ui/themes";
import Link from "next/link";
import React from "react";

function PermissionGuide() {
  return (
    <>
      <Container py="2" px="2">
        <Callout.Root color="red">
          <Callout.Icon>
            <BellIcon />
          </Callout.Icon>
          <Callout.Text className="flex flex-col gap-2">
            <span>
              You have not granted permission to receive notifications. Please
              enable notifications in your browser settings.
            </span>
            <Link
              className="underline font-bold flex items-center gap-1"
              href="https://quizmoney.ng/how-to-install-app/"
              target="_blank"
            >
              <Link2Icon /> Click to see how
            </Link>
          </Callout.Text>
        </Callout.Root>
      </Container>
    </>
  );
}

export default PermissionGuide;
