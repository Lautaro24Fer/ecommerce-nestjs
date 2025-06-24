import { Order } from "src/order/entities/order.entity"
import { Product } from "src/product/entities/product.entity"
import { User } from "src/user/entities/user.entity"

const header = (orderId: number) => {
  return `
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:22px 40px;background-color:#F7F7F7">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td data-id="__react-email-column">
                    <p style="font-size:14px;line-height:2;margin:0;font-weight:bold">Número de orden</p>
                    <p style="font-size:14px;line-height:1.4;margin:12px 0 0 0;font-weight:500;color:#6F6F6F">${orderId ?? 12345}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const presentation = (user: User, operationType: string, totalPrice: number) => {
  return `
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:40px 74px;text-align:center">
      <tbody>
        <tr>
          <td><img alt="Nike" src="https://api.padel-point.ar/products/padelpointlogo.jpg" style="display:block;outline:none;border:none;text-decoration:none;margin:auto;height: 60px;width: 60px;" />
            <h1 style="font-size:32px;line-height:1.3;font-weight:700;text-align:center;letter-spacing:-1px">Orden de compra</h1>
            <p style="font-size:14px;line-height:2;margin:0;color:#747474;font-weight:500">Se ha hecho un pedido a nombre de ${user?.name ?? 'Prueba'} ${user?.surname ?? 'Prueba'}</p>
            <p style="font-size:14px;line-height:2;margin:0;color:#747474;font-weight:500;margin-top:24px">
              Numero de ${user?.idType.name ?? 'DNI'}: ${user?.idNumber ?? 1111} <br>
              Monto de la operación: $${totalPrice ?? 0} <br>
              Tipo de operación: ${operationType ?? "PRUEBA"}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const shippingData = (name: string, surname: string, address?: string) => {
  return `
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-left:40px;padding-right:40px;padding-top:22px;padding-bottom:22px">
      <tbody>
        <tr>
          <td>
            <p style="font-size:15px;line-height:2;margin:0;font-weight:bold">Envío a nombre de: ${name} ${surname}</p>
            <p style="font-size:14px;line-height:2;margin:0;color:#747474;font-weight:500">${address ?? 'Retiro en local'}</p>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const buildProductHtml = (product: Product, quantity: number) => {

  const imageUrl: string = product?.image ?? 'https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-product.png'

  return `
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-left:40px;padding-right:40px;padding-top:40px;padding-bottom:40px">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td data-id="__react-email-column"><img alt="nombre_del_producto" src=${imageUrl} style="display:block;outline:none;border:none;text-decoration:none;float:left" width="200px" /></td>
                  <td data-id="__react-email-column" style="vertical-align:top;padding-left:12px">
                    <p style="font-size:14px;line-height:2;margin:0;font-weight:500;">${product?.name}</p>
                    <p style="font-size:14px;line-height:2;margin:0;color:#747474;font-weight:500">${product?.description}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="display:inline-flex;margin-top: 10px; margin-bottom:40px">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td data-id="__react-email-column" style="width:170px">
                    <p style="font-size:14px;line-height:2;margin:0;font-weight:bold">Id del producto</p>
                    <p style="font-size:14px;line-height:1.4;margin:12px 0 0 0;font-weight:500;color:#6F6F6F">${product.id}</p>
                  </td>
                  <td data-id="__react-email-column">
                    <p style="font-size:14px;line-height:2;margin:0;font-weight:bold">Cantidad solicitada</p>
                    <p style="font-size:14px;line-height:1.4;margin:12px 0 0 0;font-weight:500;color:#6F6F6F">${quantity}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const userInfo = (user: User, emitionDate: Date) => {
  return `
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-left:20px;padding-right:20px;padding-top:20px;background-color:#F7F7F7">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <p style="font-size:14px;line-height:24px;margin:16px 0;padding-left:20px;padding-right:20px;font-weight:bold">Información del cliente</p>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-top:22px;padding-bottom:22px;padding-left:20px;padding-right:20px">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td colSpan="1" data-id="__react-email-column" style="width:33%"><a href="/" style="color:#000;text-decoration-line:none;font-size:13.5px;margin-top:0;font-weight:500" target="_blank">Nombre completo: ${user?.name} ${user?.surname}</a></td>
                  <td colSpan="1" data-id="__react-email-column" style="width:33%"><a href="/" style="color:#000;text-decoration-line:none;font-size:13.5px;margin-top:0;font-weight:500" target="_blank">Correo: ${user?.email}</a></td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-top:0;padding-bottom:22px;padding-left:20px;padding-right:20px">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td colSpan="2" data-id="__react-email-column" style="width:66%"><a href="/" style="color:#000;text-decoration-line:none;font-size:13.5px;margin-top:0;font-weight:500" target="_blank">Numero de documento: ${user?.idNumber}</a></td>
                </tr>
              </tbody>
            </table>
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding-left:20px;padding-right:20px;padding-top:32px;padding-bottom:22px">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td data-id="__react-email-column">
                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody style="width:100%">
                        <tr style="width:100%">
                          <td data-id="__react-email-column" style="width:16px"><img height="26px" src="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-phone.png" style="display:block;outline:none;border:none;text-decoration:none;padding-right:14px" width="16px" /></td>
                          <td data-id="__react-email-column">
                            <p style="font-size:13.5px;line-height:24px;margin:16px 0;margin-top:0;font-weight:500;color:#000;margin-bottom:0">+543364214567</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td data-id="__react-email-column">
                    <p style="font-size:13.5px;line-height:24px;margin:16px 0;margin-top:0;font-weight:500;color:#000;margin-bottom:0">Fecha de emision: ${emitionDate}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const createOrderLayout = (order: Order) => {

  const headerLayout: string = header(order.id);

  // const totalPrice: number = order?.productOrder?.reduce((acum, curr) => acum = acum + (curr.product.price * curr.quantity), 0);
  const totalPrice: number = order.total;

  const presentationLayout: string = presentation(order?.user, order?.paymentMethod, totalPrice );
  const shippingDataLayout: string = shippingData(order?.user?.name, order?.user?.surname, order?.address?.postalCode);
  const productLayout: string[] = order?.productOrder?.map((p) => {
    const productHtml: string = buildProductHtml(p.product, p.quantity);
    return productHtml;
  })
  const userInfoLayout: string = userInfo(order?.user, order?.dateCreated);

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-logo.png" />
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-product.png" />
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-recomendation-1.png" />
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-recomendation-2.png" />
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-recomendation-4.png" />
    <link rel="preload" as="image" href="https://react-email-demo-bymyam2i5-resend.vercel.app/static/nike-phone.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Get your order summary, estimated delivery date and more<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
  </div>

  <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;margin:10px auto;width:600px;border:1px solid #E5E5E5">
      <tbody>
        <tr style="width:100%">
          <td>
            <!-- HEADER SUPERIOR -->
            ${headerLayout}
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
            <!-- HEADER PRINCIPAL - PRESENTACIÓN -->
            ${presentationLayout}
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
            <!-- INFORMACIÓN DEL ENVÍO ( Validar si requiere envío o retiro ) -->
           ${shippingDataLayout}
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
            <!-- INFORMACIÓN DE UN PRODUCTO -->
            ${productLayout}
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
            <!-- INFORMACIÓN DEL USUARIO -->
            ${userInfoLayout}
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E5E5;margin:0" />
          </td>
        </tr>
      </tbody>
    </table><!--/$-->
  </body>

</html>
  `
}

export default createOrderLayout;