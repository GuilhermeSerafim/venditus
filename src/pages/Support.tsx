import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Feedback enviado!",
        description: "Agradecemos seu contato. Analisaremos sua mensagem em breve.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <AppLayout 
      title="Central de Ajuda" 
      description="Tire suas dúvidas e entre em contato conosco"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
        
        {/* Contact Channels */}
        <div className="col-span-full mb-4">
          <h2 className="text-xl font-bold mb-4 font-display">Canais de Atendimento</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:border-gold/50 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base">WhatsApp</CardTitle>
                  <CardDescription>Atendimento rápido</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://wa.me/5511970349947" target="_blank" rel="noopener noreferrer">
                    Iniciar Conversa
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-gold/50 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">E-mail</CardTitle>
                  <CardDescription className="text-xs">Respondo em até 48 horas</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:guilerstudies@gmail.com">
                    Enviar E-mail
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-gold/50 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Telefone</CardTitle>
                  <CardDescription>Seg-Sex, 9h às 18h</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:+5511970349947">
                    Ligar Agora
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
              <CardDescription>
                Encontre respostas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como cadastro um novo usuário?</AccordionTrigger>
                  <AccordionContent>
                    Vá até a página "Usuários" no menu lateral e clique no botão "Novo Usuário". Preencha os dados e escolha a função (Admin, Gerente, Vendedor, etc.). O novo usuário receberá um e-mail para definir a senha.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funcionam as permissões de acesso?</AccordionTrigger>
                  <AccordionContent>
                    As permissões são baseadas na função do usuário. 
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li><strong>Administrador:</strong> Acesso total ao sistema.</li>
                      <li><strong>Gerente:</strong> Acesso a relatórios e gestão de equipe.</li>
                      <li><strong>Vendedor:</strong> Acesso a leads e vendas.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Como exportar relatórios?</AccordionTrigger>
                  <AccordionContent>
                    Na página "Exportar", você pode selecionar o tipo de dado (Vendas, Leads, Financeiro), definir o período e baixar em formato CSV ou Excel.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Posso personalizar as cores do sistema?</AccordionTrigger>
                  <AccordionContent>
                    Sim! Se você for Administrador, acesse "Configurações" no menu lateral. Lá você pode alterar as cores do tema e fazer upload da logo da sua empresa.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>O que fazer se esquecer minha senha?</AccordionTrigger>
                  <AccordionContent>
                    Na tela de login, clique em "Esqueci minha senha". Você receberá um link no seu e-mail cadastrado para redefinir o acesso.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Envie um Feedback</CardTitle>
              <CardDescription>
                Encontrou um erro ou tem uma sugestão? Conte para nós.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input id="subject" placeholder="Ex: Sugestão de melhoria" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Descreva sua sugestão ou problema..." 
                    className="min-h-[120px] resize-none"
                    required 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
};

export default Support;
