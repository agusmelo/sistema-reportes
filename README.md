## Como usar el programa
TODO 
1. Se tiene que runnear en administrador de sistema, para poder hacer los system links


## Como configurar las fonts ([doc](https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/vfs/)):

1. Poner las fonts que se quieran usar en la carpeta `src/assets/fonts/`
2. Ejecutar el install_pdfmake_fonts.bat desde root directory
3. Ser feliz

## Definicion de estados:

1. .BIEN - Cliente Existente + Matricula Existente Relacionada + Coincide Marca Y modelo 
2. .MAL: ErrorNoCoincideMarcaModelo - CLiente Existente + Matricula Existente Relacionada + NO Coincide Marca Y modelo 
3. .MAL: ErrorClienteExisteVehiculoExisteNoRelacionado - Cliente Existente + Matricula Existente NO Relaciondad + SI/NO Coincide Marca Y modelo 
4. .BIEN (Se crea nuevo vehiculo): OldUserNewVehicle - Cliente Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo 
5. .MAL: ErrorClienteNoExisteVehiculoExisteNoRelacionado - Cliente NO Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y Modelo 
6. .BIEN: newUserNewVehicle - (Se crea nuevo cliente y vehiculo) - Cliente NO Existente + Matricula NO Existente +  Coincide Marca Y Modelo