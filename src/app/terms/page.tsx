import type { Metadata } from "next";
import {
  A,
  Callout,
  CONTACT_EMAIL,
  LegalPage,
  P,
  Section,
  UL,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of use — favTube",
  description:
    "The rules for using favTube: what you can post, what we can remove, and what we promise.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      lede="The rules for using favTube. Plain language, no tricks, and worth reading before you sign up."
    >
      <Section title="1. What favTube is">
        <P>
          favTube lets you publish a ranked top ten of your favorite YouTube
          videos as a public profile. Other people can browse profiles, follow
          you, leave feedback on your list, and like each other&apos;s comments.
          You cannot leave feedback on your own profile, but you can reply to
          feedback other people leave on it.
        </P>
        <P>
          favTube is a personal project, operated from Somaliland by an
          individual. It is free to use. In these terms, <strong>we</strong> and{" "}
          <strong>favTube</strong> mean that operator, and <strong>you</strong>{" "}
          means you.
        </P>
      </Section>

      <Section title="2. Who can use favTube">
        <P>
          You must be at least 13 years old to use favTube, or at least 16 if
          you are in the European Economic Area or the United Kingdom. By
          creating an account you confirm that you meet that age requirement. We
          do not ask for your date of birth, so we rely on you here.
        </P>
        <P>
          If you believe an account has been created by a child below that age,
          write to <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> and
          we will remove it.
        </P>
      </Section>

      <Section title="3. Your account">
        <P>
          You are responsible for what happens under your account and for
          keeping your password to yourself. Tell us if you think someone else
          has access to it.
        </P>
        <Callout>
          <strong>There is currently no password reset.</strong> favTube cannot
          send email yet, so if you signed up with an email address and password
          and then forget that password, we have no way to let you back in. If
          this worries you, sign in with Google instead. Google can always
          recover your access.
        </Callout>
        <P>
          Accounts created through Google have no favTube password at all. There
          is nothing to reset, and the password form in settings will tell you
          there is nothing to change.
        </P>
        <P>
          Usernames are first come, first served, and you can change yours in
          settings at any time. They are case-insensitive, so two people cannot
          hold the same handle in different capitalisations. We may reclaim a
          username that impersonates someone else, or one that is being used to
          mislead people.
        </P>
      </Section>

      <Section title="4. YouTube">
        <P>
          favTube is built on YouTube. It does not host, store, or serve any
          video files. Every video plays inside YouTube&apos;s own embedded
          player, and favTube keeps only the title, channel name, thumbnail, and
          duration of the videos you add.
        </P>
        <Callout>
          favTube uses YouTube API Services. By using favTube, you agree to be
          bound by the{" "}
          <A href="https://www.youtube.com/t/terms">
            YouTube Terms of Service
          </A>
          .
        </Callout>
        <P>
          What you can watch, and whether a video stays available at all, is
          decided by YouTube and by the people who upload to it, not by us. If a
          video you ranked is deleted or made private on YouTube, favTube drops
          it from your top ten the next time your profile is loaded and closes
          the gap in the ranking. We do not ask you first, and the entry cannot
          be recovered.
        </P>
        <P>
          Our <A href="/privacy">privacy policy</A> explains what information
          Google receives when you or your visitors use favTube.
        </P>
      </Section>

      <Section title="5. What you post stays yours">
        <P>
          Your name, bio, ranked videos, and comments belong to you. We do not
          claim ownership of them and we will not sell them.
        </P>
        <P>
          To actually run the service, we need your permission to store your
          content and show it to other people. So by posting on favTube you give
          us a non-exclusive, worldwide, royalty-free licence to store, display,
          and distribute that content for the purpose of operating favTube. This
          licence ends when you delete the content or your account, except that
          search engines and archives may keep copies we do not control.
        </P>
        <P>
          You confirm that you have the right to post what you post, and that it
          does not infringe anyone else&apos;s rights.
        </P>
      </Section>

      <Section title="6. Things you may not do">
        <P>Do not use favTube to:</P>
        <UL>
          <li>
            harass, threaten, bully, or target anyone, or post hate speech
          </li>
          <li>
            post or link to sexual content involving minors, or any content that
            is illegal where you or we are
          </li>
          <li>impersonate another person, brand, or organisation</li>
          <li>post spam, scams, malware, or bulk promotional content</li>
          <li>
            link to material that infringes someone else&apos;s copyright or
            other rights
          </li>
          <li>
            scrape, crawl, or access favTube with automated tools, or try to get
            around our rate limits, security, or the private-profile setting
          </li>
          <li>
            attempt to break, overload, or gain unauthorised access to any part
            of the service
          </li>
        </UL>
      </Section>

      <Section title="7. Moderation and ending your access">
        <P>
          We may remove content or suspend or delete an account that breaks
          these terms, or where we are required to by law. Where it is
          reasonable to do so, we will tell you why.
        </P>
        <P>
          Be aware that moderation here is manual and handled by one person.
          There is no report button in the app yet. If you see something that
          breaks these rules, email{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> with a link to
          the profile or comment, and we will look at it as soon as we can. We
          cannot promise a response time.
        </P>
        <P>
          You can stop using favTube whenever you like and delete your account
          yourself from settings. Deleting asks for your password first, happens
          straight away, and cannot be undone. It also takes down the feedback
          other people left on your profile. Our{" "}
          <A href="/privacy">privacy policy</A> lists exactly what goes.
        </P>
      </Section>

      <Section title="8. Copyright complaints">
        <P>
          If you believe something on favTube infringes your copyright, email{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> with:
        </P>
        <UL>
          <li>a link to the exact page or comment</li>
          <li>a description of the work you say is infringed</li>
          <li>your name and contact details</li>
          <li>
            a statement that you believe in good faith that the use is not
            authorised, and that the information you have given is accurate
          </li>
        </UL>
        <P>
          We will remove content that is clearly infringing. Remember that
          favTube does not host videos. To have a video itself taken down you
          need to go to <A href="https://www.youtube.com/t/terms">YouTube</A>,
          not to us. We can only remove the entry pointing at it.
        </P>
      </Section>

      <Section title="9. Your profile is public by default">
        <P>
          When your profile is public, anyone on the internet can see your name,
          username, bio, your ranked videos, your follower and following counts,
          and the whole comment thread on your profile, including the names of
          everyone who commented. They do not need a favTube account, and search
          engines can index the page.
        </P>
        <P>
          A public profile with at least one ranked video can also be listed on
          the discover page, and whichever public profile has ranked the most
          videos is the one the homepage shows off as an example. Neither is
          something you opt into.
        </P>
        <P>
          You can switch your profile to private in settings. That hides it from
          everyone but you, keeps it out of the discover page and the homepage,
          and asks search engines not to index it. It does not delete anything,
          and it cannot claw back copies of pages that were already public.
        </P>
      </Section>

      <Section title="10. favTube is provided as-is">
        <P>
          favTube is free and provided as-is, with no warranty of any kind. We
          do not promise that it will be available, uninterrupted, error-free,
          or that anything you post will be preserved. We may change features,
          or stop running favTube entirely, at any time.
        </P>
        <P>
          Please keep your own record of anything you would be upset to lose.
        </P>
      </Section>

      <Section title="11. Limits on our liability">
        <P>
          To the fullest extent the law allows, we are not liable for indirect
          or consequential losses, lost data, lost profits, or loss of goodwill
          arising from your use of favTube.
        </P>
        <P>
          We are also not responsible for YouTube content, for its availability,
          or for what other users post. Nothing in these terms limits liability
          that cannot legally be limited, including liability for death or
          personal injury caused by negligence, or for fraud.
        </P>
      </Section>

      <Section title="12. If we add paid features">
        <P>
          favTube is entirely free today, and there is nothing to buy. If we
          ever introduce paid features, we will show the price, billing terms,
          and refund terms before you are asked to pay, and update these terms
          first. Nothing here obliges you to pay for anything.
        </P>
      </Section>

      <Section title="13. Changes to these terms">
        <P>
          We may update these terms. When we do, we will change the date at the
          top of this page, and for significant changes we will say so on the
          site. Because favTube cannot send email, this page is the only place
          changes are announced, so it is worth a look now and then. Carrying on
          using favTube after a change means you accept it.
        </P>
      </Section>

      <Section title="14. Contact, and where we are">
        <P>
          favTube is operated from Somaliland. You can reach us at{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> with questions
          about these terms, reports, takedowns, or anything about your data.
        </P>
        <P>
          If something goes wrong, please email us first. Almost everything can
          be sorted out that way. These terms do not take away any rights you
          have under the consumer protection laws of the country you live in,
          and you can always bring a claim in your local courts.
        </P>
      </Section>
    </LegalPage>
  );
}
