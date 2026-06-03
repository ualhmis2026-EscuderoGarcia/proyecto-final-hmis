
// Test Iteración 2 - Información económica y mantenimiento mensual
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

public class Test15InformacionEconomicaTest {
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
    public void test15InformacionEconomica() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        String timestamp = String.valueOf(System.currentTimeMillis());
        String nombreProyecto = "Cliente Economia Selenium " + timestamp;

        String precioWeb = "600";
        String importeCobrado = "200";
        String cuotaMensual = "50";
        String notasMantenimiento = "Mantenimiento creado por Selenium";

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

        // Ir a Información Económica
        WebElement seccionEconomica = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Información Económica')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", seccionEconomica);
        Thread.sleep(700);

        // Rellenar precio web e importe cobrado por placeholder 0.00
        rellenarInputPorPlaceholderEIndice("0.00", 0, precioWeb); // Precio de la web
        rellenarInputPorPlaceholderEIndice("0.00", 1, importeCobrado); // Importe cobrado

        // Activar mantenimiento si no está activo
        activarMantenimientoSiHaceFalta();

        // Tras activar mantenimiento, rellenar cuota mensual
        rellenarInputPorPlaceholderEIndice("0.00", 2, cuotaMensual); // Cuota mensual

        // Rellenar notas internas del mantenimiento
        rellenarTextareaPorPlaceholder("Observaciones sobre el contrato de mantenimiento...", notasMantenimiento);

        // Comprobar que en el propio formulario se muestra el estado o importe
        // pendiente
        Boolean pendienteVisible = (Boolean) js.executeScript(
                "return document.body.innerText.includes('Pendiente');");

        assertTrue("Debe mostrarse el estado o importe pendiente", pendienteVisible);

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

        // Comprobar tarjeta de información económica
        WebElement infoEconomica = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//*[contains(text(),'Información Económica')]")));
        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", infoEconomica);
        Thread.sleep(1000);

        assertTrue(infoEconomica.isDisplayed());

        Boolean datosEconomicosVisibles = (Boolean) js.executeScript(
                "return document.body.innerText.includes('600') " +
                        "&& document.body.innerText.includes('200') " +
                        "&& document.body.innerText.includes('50');");

        assertTrue("Deben aparecer los importes económicos del proyecto y mantenimiento", datosEconomicosVisibles);
    }

    private void rellenarInputPorPlaceholderEIndice(String placeholder, int index, String valor)
            throws InterruptedException {
        WebElement input = (WebElement) js.executeScript(
                "const inputs = Array.from(document.querySelectorAll('input'))" +
                        "  .filter(i => i.placeholder === arguments[0]);" +
                        "return inputs[arguments[1]] || null;",
                placeholder,
                index);

        assertNotNull("Debe encontrarse el input con placeholder " + placeholder + " e índice " + index, input);

        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", input);
        Thread.sleep(400);

        input.clear();
        input.sendKeys(valor);

        Thread.sleep(400);
    }

    private void activarMantenimientoSiHaceFalta() throws InterruptedException {
        WebElement toggle = (WebElement) js.executeScript(
                "const texto = 'Mantenimiento mensual contratado';" +
                        "const candidatos = Array.from(document.querySelectorAll('*'))" +
                        "  .filter(e => e.children.length === 0 && e.textContent && e.textContent.trim().includes(texto));"
                        +
                        "if (candidatos.length === 0) return null;" +
                        "let nodo = candidatos[0];" +
                        "for (let i = 0; i < 10 && nodo; i++) {" +
                        "  const controles = Array.from(nodo.querySelectorAll('button, [role=\"switch\"], input[type=\"checkbox\"]'));"
                        +
                        "  if (controles.length > 0) return controles[controles.length - 1];" +
                        "  nodo = nodo.parentElement;" +
                        "}" +
                        "return null;");

        assertNotNull("Debe encontrarse el toggle de mantenimiento mensual", toggle);

        js.executeScript("arguments[0].scrollIntoView({block: 'center'});", toggle);
        Thread.sleep(500);

        String className = toggle.getAttribute("class");
        String ariaPressed = toggle.getAttribute("aria-pressed");

        boolean pareceActivo = "true".equalsIgnoreCase(ariaPressed) ||
                (className != null && className.toLowerCase().contains("blue"));

        if (!pareceActivo) {
            js.executeScript("arguments[0].click();", toggle);
            Thread.sleep(1000);
        }
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