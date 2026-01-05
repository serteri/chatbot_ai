'use client'; // BU SATIR ÇOK ÖNEMLİ

import React from 'react';

// Tip tanımlamaları (kendi projenize göre düzenleyin)
interface Chatbot {
    id: string;
    name: string;
    createdAt: Date;
}

interface Props {
    chatbots: Chatbot[];
}

export default function ChatbotListClient({ chatbots }: Props) {
    // onSelect fonksiyonunu BURADA, Client Component içinde tanımlıyoruz
    const onSelect = (chatbotId: string) => {
        console.log("Seçilen ID:", chatbotId);
        // Burada state güncelleyebilir veya router.push yapabilirsiniz
    };

    return (
        <div>
            {chatbots.map((bot) => (
                <div
                    key={bot.id}
                    onClick={() => onSelect(bot.id)} // Artık hata vermez
                    className="cursor-pointer p-2 hover:bg-gray-100"
                >
                    {bot.name}
                </div>
            ))}
        </div>
    );
}
