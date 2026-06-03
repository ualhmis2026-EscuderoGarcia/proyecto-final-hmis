
// Test Iteración 2 - Servicios adicionales
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

public class Test13ServiciosAdicionalesTest {
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
    public void test13ServiciosAdicionales() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        String nombreProyecto = "Cliente Servicios Selenium " + System.currentTimeMillis();

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

        // Crear nuevo proyecto
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

        // Rellenar nombre del cliente/proyecto
        WebElement nombreClienteInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='text']")));
        nombreClienteInput.clear();
        nombreClienteInput.sendKeys(nombreProyecto);

        // Ir a la sección de servicios adicionales
        WebElement seccionServicios = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Servicios Adicionales')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", seccionServicios);
        Thread.sleep(700);

        // Activar servicios adicionales
        activarServicio("Ficha de Google Business Profile");
        activarServicio("Campañas de Google Ads");

        // Comprobar que el resumen lateral refleja los servicios incluidos
        Boolean resumenIncluyeServicios = (Boolean) js.executeScript(
                "return document.body.innerText.includes('Google Business') " +
                        "&& document.body.innerText.includes('Google Ads') " +
                        "&& document.body.innerText.includes('Incluido');");

        assertTrue(
                "El resumen lateral debe mostrar Google Business y Google Ads como incluidos",
                resumenIncluyeServicios);

        // Guardar proyecto
        WebElement botonGuardar = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(., 'Guardar Proyecto')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", botonGuardar);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", botonGuardar);

        // Comprobar que vuelve al listado
        WebElement tituloProyectosDespues = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Proyectos Activos')]")));
        assertEquals("Proyectos Activos", tituloProyectosDespues.getText());

        // Comprobar que el proyecto creado aparece
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

        // Comprobar sección de servicios contratados dentro del proyecto
        WebElement serviciosContratados = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Servicios Contratados')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", serviciosContratados);
        Thread.sleep(1000);
        assertTrue(serviciosContratados.isDisplayed());

        // Comprobación flexible del contenido visible del proyecto
        Boolean apareceGoogleBusiness = (Boolean) js.executeScript(
                "return document.body.innerText.includes('Google Business') " +
                        "|| document.body.innerText.includes('Ficha de Google') " +
                        "|| document.body.innerText.includes('Business Profile');");

        assertTrue(
                "Debe aparecer el servicio de Google Business/Ficha de Google en el proyecto",
                apareceGoogleBusiness);

        Boolean apareceGoogleAds = (Boolean) js.executeScript(
                "return document.body.innerText.includes('Google Ads') " +
                        "|| document.body.innerText.includes('Campañas de Google Ads') " +
                        "|| document.body.innerText.includes('Ads');");

        assertTrue(
                "Debe aparecer el servicio de Google Ads en el proyecto",
                apareceGoogleAds);
    }

    private void activarServicio(String textoServicio) throws InterruptedException {
        WebElement toggle = (WebElement) js.executeScript(
                "const texto = arguments[0];" +
                        "const candidatos = Array.from(document.querySelectorAll('*'))" +
                        "  .filter(e => e.children.length === 0 && e.textContent && e.textContent.trim() === texto);" +
                        "if (candidatos.length === 0) return null;" +
                        "let nodo = candidatos[0];" +
                        "for (let i = 0; i < 8 && nodo; i++) {" +
                        "  const botones = Array.from(nodo.querySelectorAll('button'));" +
                        "  if (botones.length > 0) return botones[botones.length - 1];" +
                        "  const switches = Array.from(nodo.querySelectorAll('[role=\"switch\"]'));" +
                        "  if (switches.length > 0) return switches[switches.length - 1];" +
                        "  const checks = Array.from(nodo.querySelectorAll('input[type=\"checkbox\"]'));" +
                        "  if (checks.length > 0) return checks[checks.length - 1];" +
                        "  nodo = nodo.parentElement;" +
                        "}" +
                        "return null;",
                textoServicio);

        assertNotNull("Debe encontrarse el toggle de " + textoServicio, toggle);

        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", toggle);
        Thread.sleep(500);
        js.executeScript("arguments[0].click();", toggle);
        Thread.sleep(1000);
    }
}