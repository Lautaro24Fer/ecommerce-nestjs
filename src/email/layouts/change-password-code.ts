export const resetPasswordLayout = (code: number) => {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Padel Point Reset Password</div>
  <body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;background-color:#ffffff;border:1px solid #ddd;border-radius:5px;width:480px;margin:0 auto;padding:12% 6%">
      <tbody>
        <tr style="width:100%">
          <td>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" style="height:15em;width:15em;" viewBox="0 0 500 500"><g transform="matrix(.1 0 0 -.1 0 500)"><path d="M1955 3368c-3-24-11-56-16-73-5-16-20-88-34-160-13-71-32-159-40-195-16-67-57-264-76-360-6-30-26-125-45-210s-55-252-79-370-53-258-65-310c-11-52-20-101-20-107 0-10 59-13 264-13h263l23 83c12 45 30 111 41 147 109 373 114 504 28 757-37 109-41 129-46 254-6 131-5 138 20 193 30 64 128 172 179 197 115 57 233 79 311 59 83-20 186-75 255-135 36-31 91-120 113-182 41-120 21-270-50-381-51-80-134-143-291-222-185-92-309-186-310-232 0-16 13-18 144-18 153 0 156-1 156-50 0-26-15-33-40-20-16 8-30 8-56 0-57-19-66-54-62-241 3-137 5-160 22-178 23-26 87-29 110-5 15 14 16 14 16 0 0-13 12-16 55-16h55l2 267 3 267 70 13c87 15 229 85 309 150 175 144 276 380 263 618-11 209-97 350-266 439-134 70-188 76-728 76h-471l-7-42zm719-1449c8-40 8-207 0-236-9-35-40-29-48 8-8 40-8 222 0 243 11 28 41 19 48-15z"/><path d="M2572 3102c-17-11-4-42 17-42 24 0 30 8 24 31-6 20-20 24-41 11zm96-29c-21-5-21-8-8-34 12-21 18-23 39-10 13 8 7 52-7 50-4-1-15-3-24-6zm-226-31c-17-12-4-42 18-42 23 0 32 13 24 34-7 17-22 20-42 8zm312-17c-7-18 3-35 21-35s26 15 19 34c-8 20-33 21-40 1zm-212-14c-15-9-13-42 3-48 20-6 37 14 30 36-7 23-13 25-33 12zm81-47c-8-22 11-37 36-29 17 5 19 10 11 26-13 23-38 25-47 3zm-212-13c-13-8-7-51 7-51 20 1 34 19 27 39-7 23-13 25-34 12zm317-8c-19-5-23-20-10-40 8-12 52-7 52 6 0 17-26 37-42 34zm-232-32c-8-13 4-41 18-41 6 0 17 4 25 9 12 8 12 12 2 25-15 18-37 21-45 7zm315-10c-10-7-11-13-2-30 10-18 15-19 32-10 12 6 18 17 15 26-3 8-6 17-6 19 0 7-24 4-39-5zm-213-18c-21-5-21-8-8-33 12-22 54-16 46 7-3 8-6 19-6 24 0 9-4 10-32 2zm-226-31c-17-12-4-44 17-40 20 4 28 48 9 48-7 0-19-4-26-8zm312-17c-7-18 3-35 21-35s26 15 19 34c-8 20-33 21-40 1zm-217-18c-16-11-16-14-3-32s16-19 31-4c9 9 13 23 9 32-7 20-15 21-37 4zm315-6c-15-9-13-42 3-48 20-6 37 14 30 36-7 23-13 25-33 12zm-228-36c-4-9-2-21 4-27 15-15 44-1 40 19-4 23-36 29-44 8zm-217-16c-13-8-15-14-7-30 12-21 18-23 39-10 8 5 11 16 6 30-7 24-12 25-38 10zm316-6c-16-6-17-25-1-41 8-8 17-8 30-1 14 8 16 14 8 29-11 20-16 22-37 13zm-229-38c-4-9-2-21 4-27 15-15 44-1 40 19-4 23-36 29-44 8zm312-4c-8-13 4-41 18-41 22 0 37 17 30 33-7 18-39 23-48 8zm-213-18c-15-5-16-22-4-42 7-10 13-11 30-2 17 10 19 15 11 31-11 20-16 22-37 13zm82-43c-7-11 11-40 24-40 17 1 31 18 25 33-7 19-39 23-49 7zm-214-19c-10-7-11-13-2-30s16-19 31-11c12 6 16 17 13 30-6 21-20 25-42 11zm316-12c-13-8-15-14-7-30 12-21 18-23 39-10 8 5 11 16 6 30-7 24-12 25-38 10zm-225-41c3-24 17-32 36-20 18 12 4 42-20 42-14 0-19-6-16-22zm101-15c-17-6-17-28 0-41 19-16 40 2 32 27-6 21-11 23-32 14zm-277-135c8-24 22-73 30-110 18-77 27-82 84-46 19 13 57 32 84 43 60 25 68 41 24 50-40 8-162 62-200 87-37 25-39 23-22-24zm814-588v-260h110v520h-110v-260zm-805 183c-42-8-76-46-82-91l-6-42h47c40 0 48 3 56 24 5 13 13 27 18 30 16 9 34-21 30-50-2-24-11-31-53-46-59-21-92-54-101-104-9-49 12-141 36-154 32-17 78-12 100 12l20 22v-22c0-20 5-22 50-22h50v189c0 175-1 190-20 214-28 36-87 52-145 40zm65-275c0-70-10-94-34-85-22 9-22 109 0 131 27 28 34 18 34-46zm530 276c-82-30-90-50-90-219 0-194 18-225 134-225 83 0 126 49 126 143 0 28-1 28-52 25l-53-3-5-40c-4-32-9-40-25-40-18 0-20 8-23 63l-3 62h164l-5 83c-4 83-16 115-50 136-21 13-96 23-118 15zm61-98c15-33-1-81-27-81-14 0-20 8-22 29-8 67 26 103 49 52zm-1296-499c-4-13-5-43-3-68 2-37 7-45 26-47 17-3 22 2 22 17s9 23 33 29c27 7 33 13 35 40 3 27-1 34-23 42-47 18-84 13-90-13zm75-27c0-5-7-10-15-10s-15 5-15 10c0 6 7 10 15 10s15-4 15-10zm360 38c-28-15-40-53-28-88 12-31 25-40 66-40 40 0 72 30 72 68 0 51-62 84-110 60zm63-48c7-26-16-55-37-47-18 7-22 47-5 64 15 15 36 6 42-17zm337-10c0-63 2-70 20-70s20 7 20 70-2 70-20 70-20-7-20-70zm448 63c-12-3-18-14-18-35v-30l-26 31c-15 18-35 31-48 31-21 0-23-5-25-65-2-59 0-65 19-65 15 0 20 7 20 25 0 14 5 25 10 25 6 0 22-11 36-25 43-43 54-34 54 45 0 39-1 69-2 69-2-1-11-3-20-6zm242-12c0-13 8-21 23-23 19-3 22-10 25-50s6-48 23-48c16 0 19 7 19 50s3 50 20 50c13 0 20 7 20 20 0 18-7 20-65 20s-65-2-65-19z"/></g></svg>
            <h1 style="text-align:center">Solicitar cambio de contraseña</h1>
            <p style="font-size:14px;line-height:24px;margin:16px 0;text-align:center">Debes ingresar este código en la ventana del cambio de contraseña. Este mismo será válido solo los próximos 15 minutos</p>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px;max-width:100%">
              <tbody>
                <tr>
                  <td>
                    <h1 style="color:#000;display:inline-block;padding-bottom:8px;padding-top:8px;margin:0 auto;width:100%;text-align:center;letter-spacing:8px">${code ?? 123456}</h1>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:14px;line-height:24px;margin:0;color:#444;letter-spacing:0;padding:0 40px;text-align:center">¿No solicitaste el cambio de credenciales?</p>
            <p style="font-size:14px;line-height:24px;margin:0;color:#444;letter-spacing:0;padding:0 40px;text-align:center">Puedes contactar con<!-- --> <a href="mailto:support@jobaccepted.com" style="color:#444;text-decoration:underline" target="_blank">support@jobaccepted.com</a> <!-- -->si no solicitaste el codigo.</p>
          </td>
        </tr>
      </tbody>
    </table><!--/$-->
  </body>

</html>
`
}