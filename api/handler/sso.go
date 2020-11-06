package handler

import (
	"github.com/kalmhq/kalm/api/resources"
	"github.com/labstack/echo/v4"
)

func (h *ApiHandler) handleGetSSOConfig(c echo.Context) error {
	h.MustCanViewCluster(getCurrentUser(c))

	ssoConfig, err := h.resourceManager.GetSSOConfig()

	if err != nil {
		return err
	}

	if ssoConfig != nil && !h.clientManager.CanViewCluster(getCurrentUser(c)) {
		// hide sensitive info cluster viewer
		for i := range ssoConfig.Connectors {
			ssoConfig.Connectors[i].Config = nil
		}
	}

	return c.JSON(200, ssoConfig)
}

func (h *ApiHandler) handleDeleteSSOConfig(c echo.Context) error {
	h.MustCanEditCluster(getCurrentUser(c))

	err := h.resourceManager.DeleteSSOConfig()

	if err != nil {
		return err
	}

	return c.NoContent(200)
}

func (h *ApiHandler) handleUpdateSSOConfig(c echo.Context) error {
	h.MustCanEditCluster(getCurrentUser(c))

	ssoConfig := &resources.SSOConfig{}

	if err := c.Bind(ssoConfig); err != nil {
		return err
	}

	ssoConfig, err := h.resourceManager.UpdateSSOConfig(ssoConfig)

	if err != nil {
		return err
	}

	return c.JSON(200, ssoConfig)
}

func (h *ApiHandler) handleDeleteTemporaryUser(c echo.Context) error {
	h.MustCanEditCluster(getCurrentUser(c))

	ssoConfig, err := h.resourceManager.GetSSOConfig()

	if err != nil {
		return err
	}

	ssoConfig.TemporaryUser = nil
	ssoConfig, err = h.resourceManager.UpdateSSOConfig(ssoConfig)

	if err != nil {
		return err
	}

	return c.JSON(200, ssoConfig)
}

func (h *ApiHandler) handleCreateSSOConfig(c echo.Context) error {
	h.MustCanEditCluster(getCurrentUser(c))

	ssoConfig := &resources.SSOConfig{}

	if err := c.Bind(ssoConfig); err != nil {
		return err
	}

	ssoConfig, err := h.resourceManager.CreateSSOConfig(ssoConfig)

	if err != nil {
		return err
	}

	return c.JSON(201, ssoConfig)
}

func (h *ApiHandler) handleListProtectedEndpoints(c echo.Context) error {
	currentUser := getCurrentUser(c)
	endpoints, err := h.resourceManager.ListProtectedEndpoints(belongsToTenant(currentUser.Tenant))

	if err != nil {
		return err
	}

	endpoints = h.filterAuthorizedProtectedEndpoints(c, endpoints)

	return c.JSON(200, endpoints)
}

func (h *ApiHandler) handleDeleteProtectedEndpoints(c echo.Context) error {
	protectedEndpoint := &resources.ProtectedEndpoint{}

	if err := c.Bind(protectedEndpoint); err != nil {
		return err
	}

	currentUser := getCurrentUser(c)
	h.MustCanEdit(currentUser, currentUser.Tenant+"/"+protectedEndpoint.Namespace, "protectedEndpoints/"+protectedEndpoint.Name)

	err := h.resourceManager.DeleteProtectedEndpoints(protectedEndpoint)

	if err != nil {
		return err
	}

	return c.NoContent(200)
}

func (h *ApiHandler) handleCreateProtectedEndpoints(c echo.Context) error {
	protectedEndpoint := &resources.ProtectedEndpoint{}

	if err := c.Bind(protectedEndpoint); err != nil {
		return err
	}

	currentUser := getCurrentUser(c)
	h.MustCanEdit(currentUser, currentUser.Tenant+"/"+protectedEndpoint.Namespace, "protectedEndpoints/*")

	protectedEndpoint.Tenant = currentUser.Tenant
	protectedEndpoint, err := h.resourceManager.CreateProtectedEndpoint(protectedEndpoint)

	if err != nil {
		return err
	}

	return c.JSON(201, protectedEndpoint)
}

func (h *ApiHandler) handleUpdateProtectedEndpoints(c echo.Context) error {
	protectedEndpoint := &resources.ProtectedEndpoint{}

	if err := c.Bind(protectedEndpoint); err != nil {
		return err
	}

	currentUser := getCurrentUser(c)
	h.MustCanEdit(currentUser, currentUser.Tenant+"/"+protectedEndpoint.Namespace, "protectedEndpoints/"+protectedEndpoint.Name)

	protectedEndpoint, err := h.resourceManager.UpdateProtectedEndpoint(protectedEndpoint)

	if err != nil {
		return err
	}

	return c.JSON(200, protectedEndpoint)
}
