import { NextPage } from 'next'
import Layout from 'components/Layout'
import { Text } from 'components/primitives'

const PrivacyPage: NextPage = () => {
  return (
    <Layout>
      <Text>
        At NFTCanyon.io, we respect your privacy and are committed to protecting
        your personal information. This Privacy Policy outlines the types of
        information we collect, how we use it, and the measures we take to
        safeguard your privacy.
      </Text>
      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Information We Collect
      </Text>
      <Text>
        We collect two types of information: a. Personal Information: This
        includes information that can be used to identify you personally, such
        as your name, email address, and physical address. You may voluntarily
        provide this information when you create an account, subscribe to our
        newsletter, or participate in promotions. b. Non-Personal Information:
        This includes information that cannot be used to identify you
        personally, such as your IP address, browser type, and browsing habits.
        We may use cookies and similar tracking technologies to collect this
        information.
      </Text>

      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        How We Use Your Information
      </Text>
      <Text>
        We may use your information for the following purposes: a. To provide
        and maintain the Site, including personalizing your experience and
        providing customer support.
        <br />
        b. To communicate with you, including sending you newsletters,
        promotions, and updates.
        <br />
        c. To analyze and improve the Site, including understanding user
        behavior and preferences.
        <br />
        d. To enforce our Terms of Use and protect the security and integrity of
        the Site.
        <br />
        e. To comply with legal obligations and respond to requests from law
        enforcement or government authorities.
      </Text>

      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Sharing Your Information
      </Text>
      <Text>
        We may share your information with third parties in the following
        situations: a. With service providers who help us operate and maintain
        the Site.
        <br />
        b. In response to legal process, such as a subpoena or court order, or
        to comply with applicable laws and regulations.
        <br />
        c. To protect our rights, property, or safety, or the rights, property,
        or safety of our users or others.
        <br />
        d. In connection with a merger, acquisition, or other business
        transaction involving NFTCanyon.io or its assets.
        <br />
        e. With your consent or at your direction.
      </Text>
      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Security
      </Text>
      <Text>
        We implement reasonable security measures to protect your personal
        information from unauthorized access, use, or disclosure. However, no
        method of transmission over the Internet or electronic storage is
        completely secure, and we cannot guarantee the absolute security of your
        information.
      </Text>

      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Third-Party Links and Services
      </Text>
      <Text>
        Our Site may contain links to third-party websites, services, or
        resources that are not owned or controlled by NFTCanyon.io. We are not
        responsible for the content, privacy practices, or terms of use of these
        third-party sites. Please review the privacy policies of any third-party
        sites you visit.
      </Text>
      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Childrens Privacy
      </Text>
      <Text>
        Our Site is not intended for use by children under the age of 13, and we
        do not knowingly collect personal information from children under 13. If
        we become aware that we have collected personal information from a child
        under 13, we will promptly delete the information from our records.
      </Text>
      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Changes to This Privacy Policy
      </Text>
      <Text>
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page. You are
        advised to review this Privacy Policy periodically for any changes.
      </Text>
      <Text css={{ display: 'block', marginTop: '10px' }} style="h6">
        Disclaimer of Warranties and Limitation of Liability
      </Text>
    </Layout>
  )
}

export default PrivacyPage
