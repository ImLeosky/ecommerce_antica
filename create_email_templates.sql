-- create_email_templates.sql
-- Creates a table for configurable email templates (order confirmation, etc.)

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read (storefront needs to read templates to send emails)
CREATE POLICY "Allow public select on email_templates"
    ON public.email_templates FOR SELECT
    USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow authenticated all on email_templates"
    ON public.email_templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default order confirmation template
INSERT INTO public.email_templates (key, subject, body_html)
VALUES (
    'order_confirmation',
    '¡Gracias por tu compra, {{customer_name}}!',
    E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f3ef; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1512; padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #cba87c; font-size: 28px; margin: 0; letter-spacing: 2px; font-weight: 400;">ANTÍCA</h1>
              <p style="color: #ffffff; opacity: 0.6; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; margin: 8px 0 0 0;">Coffee & Bakery</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1512; font-size: 22px; margin: 0 0 8px 0;">¡Gracias por tu compra, {{customer_name}}!</h2>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">Hemos recibido tu pedido correctamente. Te enviamos un resumen de tu compra:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Pedido</span><br>
                    <span style="color: #1a1512; font-size: 14px; font-weight: 600;">{{order_id}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Total pagado</span><br>
                    <span style="color: #cba87c; font-size: 20px; font-weight: 700;">$ {{total_amount}} {{currency}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Método de pago</span><br>
                    <span style="color: #1a1512; font-size: 14px;">{{payment_method}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Dirección de envío</span><br>
                    <span style="color: #1a1512; font-size: 14px;">{{customer_address}}</span>
                  </td>
                </tr>
              </table>

              <h3 style="color: #1a1512; font-size: 16px; margin: 32px 0 16px 0;">Productos</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                {{items_rows}}
              </table>

              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 32px 0 0 0; text-align: center;">
                Si tienes alguna pregunta, responde a este correo o escríbenos a <a href="mailto:antica_cafe@outlook.com" style="color: #cba87c; text-decoration: none;">antica_cafe@outlook.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1512; padding: 24px 40px; text-align: center;">
              <p style="color: #666; font-size: 11px; margin: 0;">&copy; 2025 Antíca Coffee & Bakery. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
) ON CONFLICT (key) DO NOTHING;
