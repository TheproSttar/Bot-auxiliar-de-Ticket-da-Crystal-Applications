import { createCommand, createResponder, ResponderType } from "#base";
import { createContainer } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { QuickDB } from "quick.db";

const db = new QuickDB();
const config = db.table("configAuxiliar");

// helpers para não repetir código
const buildRow = () =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Adicionar")
      .setCustomId("adicionar")
      .setEmoji({ id: "1407854328512778261" })
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setLabel("Remover")
      .setCustomId("remover")
      .setEmoji({ id: "1407861723624374352" })
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setLabel("Chave Pix")
      .setCustomId("chave-pix")
      .setEmoji({ id: "1407862449788682421" })
      .setStyle(ButtonStyle.Secondary),
  );

const buildPanel = async () => {
  const valor = (await config.get("valorTotalTicket")) ?? 0;
  return createContainer({
    accentColor: "Aqua",
    components: [
      "Painel Suporte",
      `>>> Tickets Totais: ${valor}`,
      "-# Feito por Mr. Fox",
      buildRow(),
    ],
  });
};

createCommand({
  name: "panel",
  description: "panel command",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    // garante inicialização
    if ((await config.get("valorTotalTicket")) == null) {
      await config.set("valorTotalTicket", 0);
    }
    const container = await buildPanel();
    await interaction.reply({
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
      components: [container],
    });
  },
});

createResponder({
  customId: "adicionar",
  types: [ResponderType.Button],
  async run(interaction) {
    await config.add("valorTotalTicket", 1);         // 1) altera
    const container = await buildPanel();            // 2) lê e reconstrói
    await interaction.update({
      flags: [MessageFlags.IsComponentsV2],
      components: [container],
    });
  },
});

createResponder({
  customId: "remover",
  types: [ResponderType.Button],
  async run(interaction) {
    const atual = (await config.get("valorTotalTicket")) ?? 0;
    if (atual > 0) await config.sub("valorTotalTicket", 1); // evita negativo
    const container = await buildPanel();                   // lê e reconstrói
    await interaction.update({
      flags: [MessageFlags.IsComponentsV2],
      components: [container],
    });
  },
});

createResponder({
    customId: "chave-pix",
    types: [ResponderType.Button],

    async run(interaction) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
            .setLabel("Mandar Chave")
            .setCustomId("mandar-chave")
            .setEmoji("1407870320639086662")
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel("Pagamento Aprovado")
            .setCustomId("pagamento-aprovado")
            .setEmoji("1407869760607355060")
            .setStyle(ButtonStyle.Success),
        );

        const container = createContainer({
            accentColor: "Aqua",
            components: [
                "## Chave Pix",
                ">>> Escolha um botão",
                row
            ]
        });

        await interaction.reply({ flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral], components: [container] });
    }
});

createResponder({
    customId: "mandar-chave",
    types: [ResponderType.Button],

    async run(interaction) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
            .setLabel("Copiar Mobile")
            .setCustomId("copiar-mobile")
            .setEmoji("1407862449788682421")
            .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
            .setLabel("Qr Code")
            .setCustomId("qrcode")
            .setEmoji("1407872830955323484")
            .setStyle(ButtonStyle.Secondary),
        );

        const container = createContainer({
            accentColor: "Gold",
            components: [
                "Muito obrigado pela preferência. 🎉🤖\n\n" +

"Chave Copia e Cola: 00020126360014BR.GOV.BCB.PIX0114+55219904248475204000053039865802BR5922Davi Lucca Lopes Gomes6009SAO PAULO62140510SnZca6107O6304EC67\n" +
"Chave Telefone: \`(21) 99042-4847\`\n\n" +


"- Veja o nome de quem receberá antes. Nome: *Davi Lucca Lopes Gomes.*\n" +

"- Mande o comprovante neste mesmo canal. Para analisarmos o pagamento.\n" +

"- Verifique o valor antes do pagamento, não entregaremos o pedido se não mandar o valor completo.",
row
            ]
        });

        await interaction.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] })
    }
});

createResponder({
    customId: "copiar-mobile",
    types: [ResponderType.Button],

    async run(interaction) {
    await interaction.reply({ flags: [MessageFlags.Ephemeral], content: "00020126360014BR.GOV.BCB.PIX0114+55219904248475204000053039865802BR5922Davi Lucca Lopes Gomes6009SAO PAULO62140510SnZca6107O6304EC67"})
    }
});

createResponder({
    customId: "qrcode",
    types: [ResponderType.Button],

    async run(interaction) {
        await interaction.reply({ flags: [MessageFlags.Ephemeral], files: ["https://media.discordapp.net/attachments/1407863471651033131/1407877190816628838/Screenshot_20250820_205737_Chrome.jpg?ex=68a7b34f&is=68a661cf&hm=ed9f3e7fdccde8728a466959d873b2c68ffc032aae42f8ac78d635dd3ef252b5&=&format=webp&width=301&height=294"] });

    }
});

createResponder({
    customId: "pagamento-aprovado",
    types: [ResponderType.Button],

    async run(interaction) {
        if (!interaction.channel) {
            await interaction.reply({
                content: "❌ Não consegui identificar o canal.",
                ephemeral: true,
            });
            return; // Add explicit return
        }

        const canal = interaction.channel as TextChannel;
        const nomeAtual = canal.name;

        // Extrai o nome do usuário (tudo após o "・")
        const partesNome = nomeAtual.split("・");
        const nomeUser = partesNome.length > 1 ? partesNome[1] : partesNome[0];

        // Cria o novo nome: ✔️・aprovado-(nome do user)
        const nomeNovo = `✔️・aprovado-${nomeUser}`;

        console.log(`Nome alterado de: "${nomeAtual}" para: "${nomeNovo}"`);

        await canal.setName(nomeNovo);
        
        const container = createContainer({
            accentColor: "Green",
            components: [
                "Muito obrigado pela compra!",
                "- Deus te abençoe sempre, e em todo seu caminho ❤️.\n\n" +
                "Espere o CEO responder.",
                "<@1373105422499577938>",
                "- **Pagamento Aprovado** ✔️",
            ]
        });

        await interaction.reply({ 
            flags: [MessageFlags.IsComponentsV2], 
            components: [container] 
        });
        
        // No need for explicit return here since the function should return void
    }
});