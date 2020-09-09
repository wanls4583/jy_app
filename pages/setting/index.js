Page({
    data: {
        cretificationUrl: '',
        serviceAgreementUrl: '',
        privacyAgreementUrl: '',
        aboutUrl: '',
    },
    onLoad() {
        wx.jyApp.utils.getConfig(['certification_url', 'service_agreement_url', 'privacy_agreement_url', 'about_url']).then((data) => {
            this.setData({
                cretificationUrl: data.certification_url,
                serviceAgreementUrl: data.service_agreement_url,
                privacyAgreementUrl: data.privacy_agreement_url,
                aboutUrl: data.about_url,
            });
        });
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    }
})