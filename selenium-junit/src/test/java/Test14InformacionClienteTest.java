
// Test Iteración 2 - Información detallada del cliente
import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.*;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.JavascriptExecutor;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class Test14InformacionClienteTest {
    private WebDriver driver;
    private Map<String, Object> vars;
    private JavascriptExecutor js;

    @Before
    public void setUp() {
        driver = new FirefoxDriver();
        driver.manage().window().setSize(new Dimension(1920, 1080));
        js = (JavascriptExecutor) driver;
        vars = new HashMap<String, Object>();
    }

    @After
    public void tearDown() {
        driver.quit();
    }

    @Test
    public void test14InformacionCliente() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        String timestamp = String.valueOf(System.currentTimeMillis());
        String nombreProyecto = "Cliente Info Selenium " + timestamp;
        String contacto = "Contacto Selenium";
        String empresa = "Empresa Selenium " + timestamp;
        String email = "cliente" + timestamp + "@empresa.com";
        String telefono = "+34600111222";
        String whatsapp = "+34600333444";
        String direccion = "Aguadulce, Almería";
        String sector = "Desarrollo web";
        String nif = "B12345678";
        String notas = "Notas internas creadas por Selenium";

        driver.get("https://hmis-react-escudero.azurewebsites.net/");

        // Login
        WebElement tituloLogin = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Bienvenido de vuelta')]")));
        assertEquals("Bienvenido de vuelta", tituloLogin.getText());

        WebElement usuarioInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='text']")));
        usuarioInput.clear();
        usuarioInput.sendKeys("usuario");

        WebElement passwordInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='password']")));
        passwordInput.clear();
        passwordInput.sendKeys("hola00");

        WebElement botonLogin = wait.until(
                ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Iniciar Sesión')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", botonLogin);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", botonLogin);

        WebElement tituloProyectos = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Proyectos Activos')]")));
        assertEquals("Proyectos Activos", tituloProyectos.getText());

        // Nuevo proyecto
        WebElement botonNuevoProyecto = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(., 'Nuevo proyecto') or contains(., 'Nuevo Proyecto')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", botonNuevoProyecto);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", botonNuevoProyecto);

        WebElement tituloCrearProyecto = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Registrar Nuevo Proyecto')]")));
        assertEquals("Registrar Nuevo Proyecto", tituloCrearProyecto.getText());

        // Nombre básico del cliente/proyecto
        WebElement nombreClienteInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='text']")));
        nombreClienteInput.clear();
        nombreClienteInput.sendKeys(nombreProyecto);

        // Ir a Información del Cliente
        WebElement seccionCliente = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Información del Cliente')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", seccionCliente);
        Thread.sleep(700);

        // Rellenar campos por placeholder visible
        rellenarInputPorPlaceholder("Nombre y apellidos", contacto);
        rellenarInputPorPlaceholder("Nombre comercial o razón social", empresa);
        rellenarInputPorPlaceholder("cliente@empresa.com", email);
        rellenarInputPorPlaceholder("+34 600 000 000", telefono, 0);
        rellenarInputPorPlaceholder("+34 600 000 000", whatsapp, 1);
        rellenarInputPorPlaceholder("Ciudad, provincia o dirección", direccion);
        rellenarInputPorPlaceholder("Ej. Restauración, Retail, Legal...", sector);
        rellenarInputPorPlaceholder("Ej. B12345678", nif);
        rellenarTextareaPorPlaceholder("Observaciones privadas sobre el cliente...", notas);

        // Guardar proyecto
        WebElement botonGuardar = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(., 'Guardar Proyecto')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", botonGuardar);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", botonGuardar);

        // Comprobar listado
        WebElement tituloProyectosDespues = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Proyectos Activos')]")));
        assertEquals("Proyectos Activos", tituloProyectosDespues.getText());

        WebElement proyectoCreado = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//h3[contains(text(),'" + nombreProyecto + "')]")));
        assertTrue(proyectoCreado.isDisplayed());

        // Entrar al proyecto creado
        WebElement botonAccederProyecto = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//h3[contains(text(),'" + nombreProyecto
                                + "')]/ancestor::*[.//*[contains(text(),'Acceder al Proyecto')]][1]//*[contains(text(),'Acceder al Proyecto')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", botonAccederProyecto);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", botonAccederProyecto);

        // Comprobar tarjeta de información del cliente
        WebElement infoCliente = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Información del Cliente')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", infoCliente);
        Thread.sleep(1000);

        assertTrue(infoCliente.isDisplayed());

        Boolean datosClienteVisibles = (Boolean) js.executeScript(
                "return document.body.innerText.includes(arguments[0]) " +
                        "&& document.body.innerText.includes(arguments[1]) " +
                        "&& document.body.innerText.includes(arguments[2]);",
                empresa,
                email,
                telefono);

        assertTrue("Deben aparecer los datos detallados del cliente en el proyecto", datosClienteVisibles);
    }

    private void rellenarInputPorPlaceholder(String placeholder, String valor) {
        WebElement input = (WebElement) js.executeScript(
                "return Array.from(document.querySelectorAll('input')).find(i => i.placeholder === arguments[0]);",
                placeholder);

        assertNotNull("Debe encontrarse el input con placeholder: " + placeholder, input);

        input.clear();
        input.sendKeys(valor);
    }

    private void rellenarInputPorPlaceholder(String placeholder, String valor, int index) {
        WebElement input = (WebElement) js.executeScript(
                "return Array.from(document.querySelectorAll('input')).filter(i => i.placeholder === arguments[0])[arguments[1]];",
                placeholder,
                index);

        assertNotNull("Debe encontrarse el input con placeholder: " + placeholder + " índice " + index, input);

        input.clear();
        input.sendKeys(valor);
    }

    private void rellenarTextareaPorPlaceholder(String placeholder, String valor) {
        WebElement textarea = (WebElement) js.executeScript(
                "return Array.from(document.querySelectorAll('textarea')).find(t => t.placeholder === arguments[0]);",
                placeholder);

        assertNotNull("Debe encontrarse el textarea con placeholder: " + placeholder, textarea);

        textarea.clear();
        textarea.sendKeys(valor);
    }
}