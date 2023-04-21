import { NextPage } from 'next'
import Layout from 'components/Layout'
import { Text } from 'components/primitives'

const TermsPage: NextPage = () => {

  return (
    <Layout>
      <Text css={{display: 'block', marginTop: '10px'}} style="h6">Eligibility</Text>
      <Text>To use this Site, you must be at least 18 years old or the age of majority 
        in your jurisdiction, whichever is greater. 
        By using the Site, you represent and warrant that you meet these requirements.
        </Text>

        <Text css={{display: 'block', marginTop: '10px'}} style="h6">Changes to Terms of Use</Text>
<Text>We reserve the right to modify or update these Terms of Use at any time and without notice. Please check this page regularly for changes. By continuing to use the Site after any changes are posted, you accept those changes.</Text>

<Text css={{display: 'block', marginTop: '10px'}} style="h6">Intellectual Property</Text>
<Text>All content on the Site, including, without limitation, text, images, graphics, logos, and source code, is the property of NFTCanyon.io or its licensors and is protected by copyright and intellectual property laws. Except as expressly authorized, no part of the content may be copied, reproduced, distributed, republished, downloaded, displayed, transmitted, or distributed in any form or by any means.
</Text>
<Text css={{display: 'block', marginTop: '10px'}} style="h6">Acceptable Use</Text>
<Text>You agree not to use the Site in an unlawful, abusive, defamatory, obscene, discriminatory, or otherwise inappropriate manner. You also agree not to use the Site to transmit viruses, malware, or other harmful code.</Text>

<Text css={{display: 'block', marginTop: '10px'}} style="h6">User Accounts</Text>
<Text>To access certain features of the Site, you may need to create a user account. You are responsible for the security of your password and the use of your account. NFTCanyon.io will not be held responsible for any loss or damage resulting from your failure to protect your account.
</Text>
<Text css={{display: 'block', marginTop: '10px'}} style="h6">User-Generated Content</Text>
<Text>NFTCanyon.io may allow you to submit, upload, or post content to the Site. By submitting content, you grant NFTCanyon.io a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media. You represent and warrant that you own or have the necessary rights to submit the content and that the content does not violate any intellectual property rights, privacy rights, or any applicable laws.
</Text>
<Text css={{display: 'block', marginTop: '10px'}} style="h6">Third-Party Links and Services</Text>
<Text>The Site may contain links to third-party websites, services, or resources that are not owned or controlled by NFTCanyon.io. We are not responsible for the content, privacy practices, or terms of use of these third-party sites. By using the Site, you agree to assume all risks arising out of or associated with your use of any third-party websites or services.
</Text>
<Text css={{display: 'block', marginTop: '10px'}} style="h6">Disclaimer of Warranties and Limitation of Liability</Text>
<Text>The Site is provided on an as is and as available basis without any warranties of any kind, express or implied. NFTCanyon.io disclaims all warranties, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement. NFTCanyon.io does not warrant that the Site will be error-free, secure, or uninterrupted.
</Text>    </Layout>
  )
}

export default TermsPage
