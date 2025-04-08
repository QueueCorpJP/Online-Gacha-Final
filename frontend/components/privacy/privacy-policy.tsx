"use client";
import { useTranslations } from "@/hooks/use-translations";

export function PrivacyPolicy() {
    const { t } = useTranslations();

    const privacyPolicy = [
        {
            title: t("privacy.sections.introduction.title"),
            content: t("privacy.sections.introduction.content"),
        },
        {
            title: t("privacy.sections.collection.title"),
            content: t("privacy.sections.collection.content"),
        },
        {
            title: t("privacy.sections.purpose.title"),
            content: t("privacy.sections.purpose.content"),
        },
        {
            title: t("privacy.sections.security.title"),
            content: t("privacy.sections.security.content"),
        },
        {
            title: t("privacy.sections.outsourcing.title"),
            content: t("privacy.sections.outsourcing.content"),
        },
        {
            title: t("privacy.sections.provision.title"),
            content: t("privacy.sections.provision.content"),
        },
        {
            title: t("privacy.sections.disclosure.title"),
            content: t("privacy.sections.disclosure.content"),
        },
        {
            title: t("privacy.sections.stopUse.title"),
            content: t("privacy.sections.stopUse.content"),
        },
        {
            title: t("privacy.sections.changes.title"),
            content: t("privacy.sections.changes.content"),
        },
        {
            title: t("privacy.sections.contact.title"),
            content: t("privacy.sections.contact.content"),
        },
    ];

    return (
        <div className="space-y-8 rounded-lg p-8">
            {privacyPolicy.map((section, index) => (
                <section key={index} className="space-y-4">
                    <h2 className="text-xl font-bold text-[#111827]">{section.title}</h2>
                    <div className="whitespace-pre-line text-[#4B5563]">{section.content}</div>
                </section>
            ))}
            <div className="mt-8 text-center text-sm text-[#4B5563]">
                <p>{t("privacy.footer.conclusion")}</p>
                <p className="mt-4">{t("privacy.established", { date: "2024年1月10日" })}</p>
                <p>{t("privacy.lastUpdated", { date: "2024年1月10日" })}</p>
            </div>
        </div>
    );
}

